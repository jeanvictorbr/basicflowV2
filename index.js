// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
const { checkAndCloseInactiveTickets } = require('./utils/autoCloseTickets.js');
const { getAIResponse } = require('./utils/aiAssistant.js');
require('dotenv').config();
const db = require('./database.js');

// ... (toda a configuração inicial do bot, handlers, etc. - MANTENHA IGUAL)
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages, GatewayIntentBits.GuildMembers] });

client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandsToDeploy = [];

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        if (command.data.name !== 'debugai') {
             commandsToDeploy.push(command.data.toJSON());
        }
    }
}

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

client.once(Events.ClientReady, async () => {
    await db.initializeDatabase();
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log(`[CMD] Iniciando registo de ${commandsToDeploy.length} comando(s).`);
        if (process.env.DEV_GUILD_ID) {
            const debugCommand = client.commands.get('debugai');
            if(debugCommand) commandsToDeploy.push(debugCommand.data.toJSON());

            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.DEV_GUILD_ID),
                { body: commandsToDeploy },
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
    
    setInterval(() => {
        checkAndCloseInactiveTickets(client);
    }, 120000); 
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Erro executando comando:', error);
        }
    } else {
        let handler;
        if (interaction.customId.startsWith('modal_uniformes_edit_')) {
            handler = client.handlers.get('modal_uniformes_edit_');
        } else if (interaction.customId.startsWith('uniform_copy_preset_')) {
            handler = client.handlers.get('uniform_copy_preset_');
        } else if (interaction.customId.startsWith('ranking_page_')) {
            handler = client.handlers.get('ranking_page_');
        } else if (interaction.customId.startsWith('modal_department_details_')) { 
            handler = client.handlers.get('modal_department_details_'); 
        } else if (interaction.customId.startsWith('select_ticket_create_department_')) {
            handler = client.handlers.get('select_ticket_create_department_');
        } else if (interaction.customId.startsWith('modal_ticket_greeting_edit_')) {
            handler = client.handlers.get('modal_ticket_greeting_edit_');
        } else if (interaction.customId.startsWith('feedback_star_')) {
            handler = client.handlers.get('feedback_star_');
        } else if (interaction.customId.startsWith('feedback_submit_')) {
            handler = client.handlers.get('feedback_submit_');
        } else if (interaction.customId.startsWith('feedback_page_')) {
            handler = client.handlers.get('feedback_page_');
        } else {
            handler = client.handlers.get(interaction.customId);
        }
        
        if (!handler) return;

        try {
            await handler(interaction, client);
        } catch (error) {
            console.error(`Erro executando handler ${interaction.customId}:`, error);
        }
    }
});
// =====================================================================
// Listener de Mensagens - LÓGICA CONVERSACIONAL DA IA ATUALIZADA
// =====================================================================
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id])).rows[0];
    if (!ticket) return;

    if (ticket.warning_sent_at) {
        await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
    }
    await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

    const settings = (await db.query('SELECT tickets_ai_assistant_enabled, tickets_ai_assistant_prompt, tickets_cargo_suporte FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
    
    if (!settings || !settings.tickets_ai_assistant_enabled) return;

    const history = await message.channel.messages.fetch({ limit: 15 });
    
    let humanSupportHasReplied = false;
    for (const msg of history.values()) {
        if (msg.author.bot || msg.author.id === ticket.user_id) continue;
        
        if (msg.member && msg.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            humanSupportHasReplied = true;
            break;
        }
    }

    if (humanSupportHasReplied) return;
    
    const chatHistory = history
        .map(msg => ({
            role: msg.author.id === client.user.id ? 'assistant' : 'user',
            content: msg.content,
        }))
        .reverse();
    
    await message.channel.sendTyping();

    // Passamos o histórico E a última mensagem do utilizador para a função de IA
    const aiResponse = await getAIResponse(chatHistory, message.content, settings.tickets_ai_assistant_prompt);
    
    if (aiResponse) {
        await message.channel.send(aiResponse);
    }
});

client.login(process.env.DISCORD_TOKEN);