// Substitua o conteúdo em: index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
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
// (Esta parte permanece inalterada)
client.commands = new Collection();
const commandsToDeploy = [];
const devCommandsToDeploy = [];
const devOnlyCommands = ['devpanel', 'debugai', 'enviar'];

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
// (Esta parte permanece inalterada)
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
// (Esta parte permanece inalterada)
client.on(Events.InteractionCreate, async interaction => {
    let handler;
    let customId;

    try {
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
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'Esta interação expirou ou não foi encontrada.', ephemeral: true }).catch(() => {});
            }
            return;
        }

        await handler(interaction, client);

    } catch (error) {
        console.error(`❌ Erro CRÍTICO executando o handler de interação "${customId}":`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: '🔴 Houve um erro interno ao processar sua solicitação. A equipe de desenvolvimento foi notificada.', ephemeral: true }).catch(console.error);
        } else {
            await interaction.reply({ content: '🔴 Houve um erro interno ao processar sua solicitação. A equipe de desenvolvimento foi notificada.', ephemeral: true }).catch(console.error);
        }
    }
});


// --- Evento de Novas Mensagens ---
client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0] || {};

    // --- NOVA LÓGICA DE IA COM THREADS ---
    const isAiThread = message.channel.isThread() && message.channel.name.startsWith('💬 Conversa com IA');
    const isMentioned = message.content.includes(client.user.id);
    
    if (settings.guardian_ai_mention_chat_enabled && (isMentioned || isAiThread)) {
        try {
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!userMessage) return;

            // Se for uma menção e NÃO estiver já numa thread, cria uma nova.
            if (isMentioned && !isAiThread) {
                const thread = await message.startThread({
                    name: `💬 Conversa com IA - ${message.author.username}`,
                    autoArchiveDuration: 60, // Arquiva após 1h de inatividade
                    reason: 'Resposta da IA à menção do usuário.',
                });
                await thread.send(`Olá ${message.author}! Estou a analisar a sua questão. Um momento...`);
                await thread.members.add(message.author); // Garante que o autor está na thread

                // A IA agora responde dentro da thread, usando a mensagem original como contexto
                processAiResponse(thread, userMessage, [], settings, client);
                return; // Impede a execução do resto do código para esta mensagem
            }

            // Se for uma mensagem dentro de uma thread de IA, continua a conversa.
            if (isAiThread) {
                const oneHourAgo = Date.now() - (60 * 60 * 1000);
                const messages = await message.channel.messages.fetch({ limit: 5 });
                
                // Filtra mensagens com mais de 1 hora e formata o histórico
                const recentMessages = messages.filter(m => m.createdTimestamp > oneHourAgo);
                const chatHistory = recentMessages.map(msg => ({
                    role: msg.author.id === client.user.id ? 'assistant' : 'user',
                    content: msg.content,
                })).reverse(); // Inverte para ordem cronológica

                processAiResponse(message.channel, userMessage, chatHistory, settings, client);
                return;
            }
        } catch(err) {
            console.error('[Mention Chat AI] Erro ao criar/responder na thread:', err);
        }
    }
    // --- FIM DA NOVA LÓGICA ---

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

// Função Auxiliar para processar a resposta da IA na Thread
async function processAiResponse(channel, userMessage, chatHistory, settings, client) {
    await channel.sendTyping();
    
    // O prompt do sistema pode continuar o mesmo, pois o contexto é limpo pela thread
    const systemPrompt = `Você é um assistente amigável chamado "${client.user.username}" no servidor "${channel.guild.name}". Responda às perguntas dos usuários de forma completa, usando o histórico da conversa para manter o contexto.`;
    const useKnowledge = true; // Sempre usar a base de conhecimento nestas conversas

    const aiResponse = await getAIResponse(channel.guild.id, chatHistory, userMessage, systemPrompt, useKnowledge);

    if (aiResponse) {
        await channel.send(aiResponse);
    }
}


// --- Evento de Atualização de Membro ---
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
    const settings = (await db.query('SELECT roletags_enabled FROM guild_settings WHERE guild_id = $1', [newMember.guild.id])).rows[0];
    if (!settings || !settings.roletags_enabled) return;
    if (oldMember.roles.cache.size !== newMember.roles.cache.size) {
        await updateUserTag(newMember);
    }
});

function isAmbiguous(userMessage) {
    return (userMessage.match(/\b(registro|premium|configurar|ativar|chat|ia|painel)\b/i)) && 
           (!userMessage.match(/\b(basicflow|factionflow)\b/i));
}

client.login(process.env.DISCORD_TOKEN);