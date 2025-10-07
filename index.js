// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { checkAndCloseInactiveTickets } = require('./utils/autoCloseTickets.js');
const { getAIResponse } = require('./utils/aiAssistant.js');
const { processMessageForGuardian } = require('./utils/guardianAI.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers] });

client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();

// --- Carregamento de Comandos ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandsToDeploy = [];

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        // Adiciona todos os comandos para deploy, exceto o de debug por padrão
        if (command.data.name !== 'debugai') {
             commandsToDeploy.push(command.data.toJSON());
        }
    }
}

// --- Carregamento de Handlers ---
console.log('--- Carregando Handlers ---');
client.handlers = new Collection();
const handlersPath = path.join(__dirname, 'handlers');
const handlerTypes = ['buttons', 'modals', 'selects'];

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
        console.log(`[CMD] Iniciando registo de ${commandsToDeploy.length} comando(s).`);
        
        // Lógica de deploy de comandos (semelhante a deploy-commands.js)
        if (process.env.DEV_GUILD_ID) {
            const debugCommand = client.commands.get('debugai');
            // Clona o array para não modificar o original
            const devCommands = [...commandsToDeploy];
            if(debugCommand) devCommands.push(debugCommand.data.toJSON());

            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
                { body: devCommands },
            );
            console.log(`[CMD] Comandos registados com sucesso na guild de desenvolvimento.`);
        } else {
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
    
    // Inicia o loop de verificação de tickets inativos
    setInterval(() => {
        checkAndCloseInactiveTickets(client);
    }, 5 * 60 * 4000); // Executa a cada 5 minutos
});

// --- Evento de Interações ---
client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Erro executando o comando /${interaction.commandName}:`, error);
        }
    } else {
        // Lógica para encontrar o handler correto (incluindo handlers dinâmicos)
        const customId = interaction.customId;
        let handler = client.handlers.get(customId);
        
        if (!handler) {
            const dynamicHandlerId = Array.from(client.handlers.keys()).find(key => customId.startsWith(key));
            if (dynamicHandlerId) {
                handler = client.handlers.get(dynamicHandlerId);
            }
        }
        
        if (!handler) return;

        try {
            await handler(interaction, client);
        } catch (error) {
            console.error(`Erro executando o handler de interação "${customId}":`, error);
        }
    }
});

// --- Evento de Novas Mensagens ---
client.on(Events.MessageCreate, async message => {
    if (!message.guild || message.author.bot) return;

    // --- LÓGICA DO GUARDIAN AI ---
    try {
        await processMessageForGuardian(message);
    } catch (err) {
        console.error('[Guardian AI] Erro não tratado:', err);
    }
    // ----------------------------

    // --- LÓGICA DO ASSISTENTE DE TICKET ---
    const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id])).rows[0];
    if (!ticket) return;

    if (ticket.warning_sent_at) {
        await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
    }
    await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
    if (!settings || !settings.tickets_ai_assistant_enabled) return;

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
});


client.login(process.env.DISCORD_TOKEN);