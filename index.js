// Substitua o conteúdo em: index.js
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
client.hangmanTimeouts = new Map();

// --- Carregamento de Comandos e Handlers ---
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

// --- Evento de Interações (COM TRATAMENTO DE ERRO GLOBAL) ---
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
    
    if (message.content.includes(client.user.id) && settings.guardian_ai_mention_chat_enabled) {
        try {
            const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!userMessage) return;
            
            await message.channel.sendTyping();

            // ALTERAÇÃO APLICADA AQUI
            const channelMessages = await message.channel.messages.fetch({ limit: 6 }); // De 20 para 10
            const oneHourAgo = Date.now() - (60 * 60 * 1000);
            const chatHistory = [];

            for (const msg of channelMessages.values()) {
                if (chatHistory.length >= 5 || msg.createdTimestamp < oneHourAgo) {
                    break;
                }
                const isFromBot = msg.author.id === client.user.id;
                const isMentionToBotFromUser = msg.author.id === message.author.id && msg.content.includes(client.user.id);

                if (isFromBot || isMentionToBotFromUser) {
                    chatHistory.push({
                        role: msg.author.id === client.user.id ? 'assistant' : 'user',
                        content: msg.content.replace(/<@!?\d+>/g, '').trim(),
                    });
                }
            }
            
            chatHistory.reverse();

            const systemPrompt = `Você é um assistente amigável chamado "${client.user.username}". Responda ao usuário de forma completa, usando o histórico da conversa para manter o contexto.`;
            
            const aiResponse = await getAIResponse({
                guild: message.guild,
                user: message.author,
                featureName: "Chat por Menção",
                chatHistory: chatHistory,
                userMessage: userMessage,
                customPrompt: systemPrompt,
                useBaseKnowledge: true
            });

            if (aiResponse) {
                await message.reply(aiResponse);
            }
            return;

        } catch(err) {
            console.error('[Mention Chat AI] Erro ao responder menção:', err);
        }
    }

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
        const aiResponse = await getAIResponse({
            guild: message.guild,
            user: message.author,
            featureName: "Assistente de Ticket",
            chatHistory: chatHistory,
            userMessage: message.content,
            customPrompt: settings.tickets_ai_assistant_prompt,
            useBaseKnowledge: useBaseKnowledge
        });
        
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