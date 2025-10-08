// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

// --- Carregamento de Comandos e Handlers ---
client.commands = new Collection();
const commandsToDeploy = [];
const devCommandsToDeploy = [];
const devOnlyCommands = ['devpanel', 'debugai', 'enviar']; // Adicionado 'enviar' para dev

const commandFoldersPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandFoldersPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(commandFoldersPath, file));
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

// --- Evento de Bot Pronto ---
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

// --- Evento de Interações ---
client.on(Events.InteractionCreate, async interaction => {
    // --- LÓGICA PARA OS BOTÕES DE ESCOLHA DE BOT (BasicFlow/FactionFlow) ---
    if (interaction.isButton() && (interaction.customId === 'select_bot_basicflow' || interaction.customId === 'select_bot_factionflow')) {
        try {
            if (!interaction.message.reference) {
                return await interaction.update({ content: "Não foi possível encontrar a mensagem original. Por favor, tente perguntar novamente.", components: [] });
            }
            
            const originalMessageId = interaction.message.reference.messageId;
            const originalMessage = await interaction.channel.messages.fetch(originalMessageId);
            const botSelection = interaction.customId.split('_')[2]; // 'basicflow' ou 'factionflow'
            
            // Adiciona o nome do bot à pergunta original para dar contexto
            const userMessageWithContext = `${originalMessage.content.replace(/<@!?\d+>/g, '').trim()} ${botSelection}`;

            await interaction.update({ content: `Ok, buscando informações sobre o **${botSelection === 'basicflow' ? 'BasicFlow' : 'FactionFlow'}**...`, components: [] });

            // Simula uma nova mensagem para re-acionar a IA com o contexto
            client.emit(Events.MessageCreate, originalMessage, userMessageWithContext);
        } catch (error) {
            console.error("Erro ao processar seleção de bot:", error);
            await interaction.followUp({ content: "Ocorreu um erro ao buscar a informação. A mensagem original pode ter sido apagada. Tente perguntar novamente.", ephemeral: true });
        }
        return;
    }
    
    // --- Lógica de Handlers Padrão ---
    let handler;
    let customId;
    if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
        customId = interaction.commandName;
        handler = client.handlers.get(customId) || client.commands.get(customId)?.execute;
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

    try { 
        await handler(interaction, client); 
    } catch (error) {
        console.error(`Erro executando o handler de interação "${customId}":`, error);
        if (interaction.replied || interaction.deferred) { 
            await interaction.followUp({ content: 'Houve um erro ao processar sua solicitação.', ephemeral: true }); 
        } else { 
            await interaction.reply({ content: 'Houve um erro ao processar sua solicitação.', ephemeral: true }); 
        }
    }
});


// --- Evento de Novas Mensagens ---
client.on(Events.MessageCreate, async (message, overrideContent) => {
    if (!message.guild || message.author.bot) return;

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};
    
    const contentToProcess = overrideContent || message.content;

    if (contentToProcess.includes(client.user.id) && settings.guardian_ai_mention_chat_enabled) {
        try {
            const userMessage = contentToProcess.replace(/<@!?\d+>/g, '').trim();
            
            // Verificação de Ambiguidade
            const isAmbiguous = (userMessage.match(/\b(registro|premium|configurar|ativar|chat|ia|painel)\b/i)) && 
                                (!userMessage.match(/\b(basicflow|factionflow)\b/i));

            if (isAmbiguous && !overrideContent) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder().setCustomId('select_bot_basicflow').setLabel('BasicFlow').setStyle(ButtonStyle.Primary),
                        new ButtonBuilder().setCustomId('select_bot_factionflow').setLabel('FactionFlow').setStyle(ButtonStyle.Secondary),
                    );
                await message.reply({
                    content: 'Essa função existe em mais de um bot. Você está se referindo ao **BasicFlow** ou ao **FactionFlow**?',
                    components: [row]
                });
                return;
            }

            if (userMessage.match(/^(pare|para|chega|cancelar|parar|stop)$/i)) {
                await message.reply('Entendido! Se precisar de algo mais, é só chamar. 😉');
                return;
            }

            let chatPrompt = ``;
            let useKnowledge = false;

            if (userMessage.match(/\b(piada|conte uma piada|me faça rir)\b/i)) {
                chatPrompt = `Você é um comediante. Conte uma piada curta e engraçada, no estilo 'stand-up'.`;
            } 
            else if (userMessage.match(/\b(o que você prefere|duas opções|escolha)\b/i)) {
                chatPrompt = `Crie uma pergunta divertida no formato "O que você prefere?". As duas opções devem ser interessantes, engraçadas ou difíceis de escolher.`;
            }
            else if (userMessage.match(/\b(crie uma história|narre|conte sobre)\b/i)) {
                chatPrompt = `Você é um mestre de RPG. Baseado na solicitação do usuário ("${userMessage}"), crie uma pequena narrativa (um ou dois parágrafos) sobre uma cena de roleplay. Use linguagem descritiva e imersiva.`;
            }
            else if (userMessage.match(/\b(crie um personagem|ideia de personagem)\b/i)) {
                chatPrompt = `Crie um conceito de personagem para um servidor de Roleplay (RP), baseado na solicitação do usuário ("${userMessage}"). Forneça nome, uma breve história e um objetivo.`;
            }
            else if (userMessage.match(/\b(sorte do dia|conselho)\b/i)) {
                chatPrompt = `Aja como um biscoito da sorte. Forneça uma frase curta, enigmática, engraçada ou inspiradora como um 'conselho do dia'.`;
            }
            else {
                chatPrompt = `Você é um assistente amigável chamado "${client.user.username}" no servidor "${message.guild.name}". Responda às perguntas dos usuários de forma completa, usando o histórico da conversa para manter o contexto e as informações que você possui.`;
                useKnowledge = true;
            }
            
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

    // --- Lógica Existente (Guardian e Tickets) ---
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

// --- Evento de Atualização de Membro ---
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const settings = (await db.query('SELECT roletags_enabled FROM guild_settings WHERE guild_id = $1', [newMember.guild.id])).rows[0];
    if (!settings || !settings.roletags_enabled) return;
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        await updateUserTag(newMember);
    }
});

client.login(process.env.DISCORD_TOKEN);