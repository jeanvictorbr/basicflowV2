// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { checkAndCloseInactiveTickets } = require('./utils/autoCloseTickets.js');
const { getAIResponse } = require('./utils/aiAssistant.js');
const { processMessageForGuardian } = require('./utils/guardianAI.js');
const { checkExpiredPunishments } = require('./utils/punishmentMonitor.js');
const { updateUserTag } = require('./utils/roleTagUpdater.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers] });

client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();

// --- Carregamento de Comandos e Handlers (sem alterações) ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const devOnlyCommands = ['devpanel', 'debugai'];
const commandsToDeploy = [];
const devCommandsToDeploy = [];
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data) {
        client.commands.set(command.data.name, command);
        if (devOnlyCommands.includes(command.data.name)) {
            devCommandsToDeploy.push(command.data.toJSON());
        } else {
            commandsToDeploy.push(command.data.toJSON());
        }
    }
}
console.log('--- Carregando Handlers ---');
client.handlers = new Collection();
const handlersPath = path.join(__dirname, 'handlers');
const handlerTypes = ['buttons', 'modals', 'selects', 'commands'];
handlerTypes.forEach(handlerType => {
    const handlerDir = path.join(handlersPath, handlerType);
    if (fs.existsSync(handlerDir)) {
        const handlerFiles = fs.readdirSync(handlerDir).filter(file => file.endsWith('.js'));
        for (const file of handlerFiles) {
            try {
                const handler = require(path.join(handlerDir, file));
                if (handler.customId && handler.execute) {
                    client.handlers.set(handler.customId, handler.execute);
                }
            } catch (error) {
                console.error(`[HANDLER] ❌ Erro ao carregar ${file}:`, error);
            }
        }
    }
});
console.log('--- Handlers Carregados ---');

// --- Evento de Bot Pronto (sem alterações) ---
client.once(Events.ClientReady, async () => {
    await db.synchronizeDatabase();
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        if (process.env.DEV_GUILD_ID) {
            const allDevGuildCommands = [...commandsToDeploy, ...devCommandsToDeploy];
            console.log(`[CMD] Iniciando registo de ${allDevGuildCommands.length} comando(s) na guild de desenvolvimento.`);
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
                { body: allDevGuildCommands },
            );
            console.log(`[CMD] Comandos registados com sucesso na guild de desenvolvimento.`);
        } else {
            console.log(`[CMD] Iniciando registo de ${commandsToDeploy.length} comando(s) globais.`);
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commandsToDeploy },
            );
            console.log(`[CMD] Comandos registados globalmente com sucesso.`);
        }
    } catch (error) {
        console.error('[CMD] Erro ao registar comandos:', error);
    }
    console.log(`🚀 Bot online! Logado como ${client.user.tag}`);
    setInterval(() => checkAndCloseInactiveTickets(client), 5 * 60 * 1000);
    setInterval(() => checkExpiredPunishments(client), 1 * 60 * 1000);
});

// --- Evento de Interações (sem alterações) ---
client.on(Events.InteractionCreate, async interaction => {
    let handler;
    let customId;
    if (interaction.isChatInputCommand()) {
        customId = interaction.commandName;
        handler = client.handlers.get(customId);
        if (!handler) {
            const command = client.commands.get(customId);
            if (!command) {
                console.error(`Nenhum comando correspondente a /${customId} foi encontrado.`);
                return;
            }
            try { await command.execute(interaction); } catch (error) {
                console.error(`Erro executando o comando /${customId}:`, error);
                if (interaction.replied || interaction.deferred) { await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true }); } else { await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true }); }
            }
            return;
        }
    } else if (interaction.isUserContextMenuCommand()) {
        customId = interaction.commandName;
        handler = client.handlers.get(customId);
    } else if (interaction.isButton() || interaction.isAnySelectMenu() || interaction.isModalSubmit()) {
        customId = interaction.customId;
        handler = client.handlers.get(customId);
        if (!handler) {
            const dynamicHandlerId = Array.from(client.handlers.keys()).find(key => key.endsWith('_') && customId.startsWith(key));
            if (dynamicHandlerId) {
                handler = client.handlers.get(dynamicHandlerId);
            }
        }
    }
    if (!handler) {
        console.warn(`[HANDLER] Nenhum handler encontrado para a interação "${customId}"`);
        return;
    }
    try { await handler(interaction, client); } catch (error) {
        console.error(`Erro executando o handler de interação "${customId}":`, error);
        if (interaction.replied || interaction.deferred) { await interaction.followUp({ content: 'Houve um erro ao processar sua solicitação.', ephemeral: true }); } else { await interaction.reply({ content: 'Houve um erro ao processar sua solicitação.', ephemeral: true }); }
    }
});

// --- Evento de Novas Mensagens (LÓGICA ATUALIZADA) ---
client.on(Events.MessageCreate, async message => {
    if (!message.guild || message.author.bot) return;

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};

    // --- LÓGICA DE CHAT POR MENÇÃO E BRINCADEIRAS ---
    if (message.mentions.has(client.user.id) && settings.guardian_ai_mention_chat_enabled) {
        try {
            // Limpa a menção da mensagem para entender o que o usuário quer
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            
            let chatPrompt = ``; // Será definido pelo if/else
            let useKnowledge = false; // Por padrão, brincadeiras não usam a base de conhecimento

            // --- Estrutura para identificar a brincadeira ---

            // 1. Mestre das Piadas
            if (userMessage.match(/\b(piada|conte uma piada|me faça rir)\b/i)) {
                chatPrompt = `Você é um comediante. Conte uma piada curta e engraçada, no estilo 'stand-up'. Pode ser sobre qualquer tema, incluindo jogos, tecnologia ou situações do dia a dia.`;
            } 
            // 2. Jogo: "O Que Você Prefere?"
            else if (userMessage.match(/\b(o que você prefere|duas opções|escolha)\b/i)) {
                chatPrompt = `Crie uma pergunta divertida no formato "O que você prefere?". As duas opções devem ser interessantes, engraçadas ou difíceis de escolher. Por exemplo: 'Ter que lutar com um pato do tamanho de um cavalo ou cem cavalos do tamanho de um pato?'.`;
            }
            // 3. Mini Histórias de RP
            else if (userMessage.match(/\b(crie uma história|narre|conte sobre)\b/i)) {
                chatPrompt = `Você é um mestre de RPG. Baseado na solicitação do usuário ("${userMessage}"), crie uma pequena narrativa (um ou dois parágrafos) sobre uma cena de roleplay. Use uma linguagem descritiva e imersiva. A história deve ter um começo, meio e um final rápido.`;
            }
            // 4. Gerador de Personagem de RP
            else if (userMessage.match(/\b(crie um personagem|ideia de personagem)\b/i)) {
                chatPrompt = `Crie um conceito de personagem para um servidor de Roleplay (RP), baseado na solicitação do usuário ("${userMessage}"). Forneça um nome, uma breve história de fundo (2-3 frases) e um objetivo principal para o personagem. Seja criativo e original.`;
            }
            // 5. Sorte do Dia / Conselho do Dia
            else if (userMessage.match(/\b(sorte do dia|conselho)\b/i)) {
                chatPrompt = `Aja como um biscoito da sorte ou um velho sábio. Forneça uma frase curta, enigmática, engraçada ou inspiradora como um 'conselho do dia'.`;
            }
            // Conversa Padrão
            else {
                chatPrompt = `Você é um assistente amigável e prestativo chamado "${client.user.username}" no servidor de Discord "${message.guild.name}". Responda às perguntas dos usuários de forma educada e completa, utilizando o histórico da conversa para manter o contexto. Baseie-se no conhecimento geral e nas informações fornecidas.`;
                useKnowledge = true; // Apenas na conversa padrão usamos a base de conhecimento
            }

            // --- Lógica Comum de Resposta ---
            await message.channel.sendTyping();
            const history = await message.channel.messages.fetch({ limit: 10 });
            const chatHistory = history.map(msg => ({
                role: msg.author.id === client.user.id ? 'assistant' : 'user',
                content: msg.content,
            })).reverse();
            
            const aiResponse = await getAIResponse(message.guild.id, chatHistory, userMessage, chatPrompt, useKnowledge);

            if (aiResponse) {
                await message.reply(aiResponse);
            }
            return; 
        } catch(err) {
            console.error('[Mention Chat AI] Erro ao responder menção:', err);
        }
    }

    // --- LÓGICA EXISTENTE (GUARDIAN E TICKETS) ---
    try {
        await processMessageForGuardian(message);
    } catch (err) {
        console.error('[Guardian AI] Erro não tratado:', err);
    }

    const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id])).rows[0];
    if (ticket) {
        if (ticket.warning_sent_at) {
            await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
        }
        await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

        if (!settings.tickets_ai_assistant_enabled) return;

        const history = await message.channel.messages.fetch({ limit: 15 });
        let humanSupportHasReplied = false;
        for (const msg of history.values()) {
            if (msg.author.bot || msg.author.id === ticket.user_id) continue;
            const member = await message.guild.members.fetch(msg.author.id).catch(() => null);
            if (member && member.roles.cache.has(settings.tickets_cargo_suporte)) {
                humanSupportHasReplied = true;
                break;
            }
        }

        if (humanSupportHasReplied) return;
        
        const chatHistory = history.map(msg => ({
            role: msg.author.id === client.user.id ? 'assistant' : 'user',
            content: msg.content,
        })).reverse();
        
        await message.channel.sendTyping();
        
        const useBaseKnowledge = settings.tickets_ai_use_base_knowledge !== false;
        const aiResponse = await getAIResponse(message.guild.id, chatHistory, message.content, settings.tickets_ai_assistant_prompt, useBaseKnowledge);
        
        if (aiResponse) {
            await message.channel.send(aiResponse);
        }
    }
});

// --- Evento de Atualização de Membro (sem alterações) ---
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const settings = (await db.query('SELECT roletags_enabled FROM guild_settings WHERE guild_id = $1', [newMember.guild.id])).rows[0];
    if (!settings || !settings.roletags_enabled) return;
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        await updateUserTag(newMember);
    }
});

client.login(process.env.DISCORD_TOKEN);