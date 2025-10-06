// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { checkAndCloseInactiveTickets } = require('./utils/autoCloseTickets.js');
const { getAIResponse } = require('./utils/aiAssistant.js'); // NOVO IMPORT
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });

client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();

// ... (Carregadores de Comandos e Handlers como antes) ...
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
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
                    console.log(`[HANDLER] ✅ ${handler.customId}`);
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
        
        if (!handler) {
            console.warn(`Nenhum handler encontrado para: ${interaction.customId}`);
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: 'Este botão não tem uma função definida.', ephemeral: true });
                }
            } catch (e) { /* Ignora */ }
            return;
        }

        try {
            await handler(interaction, client);
        } catch (error) {
            console.error(`Erro executando handler ${interaction.customId}:`, error);
        }
    }
});

// LISTENER DE MENSAGENS ATUALIZADO PARA INCLUIR A IA
client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [message.channel.id])).rows[0];
    
    if (ticket) {
        // Lógica de cancelar o auto-fechamento
        if (ticket.warning_sent_at) {
            await message.channel.send('✅ O fechamento automático deste ticket foi cancelado.');
        }
        await db.query('UPDATE tickets SET last_message_at = NOW(), warning_sent_at = NULL WHERE channel_id = $1', [message.channel.id]);

        // LÓGICA DO ASSISTENTE DE IA
        // Verifica se é a primeira mensagem do utilizador no ticket
        const messages = await message.channel.messages.fetch({ limit: 5 });
        const userMessages = messages.filter(m => !m.author.bot);
        
        if (userMessages.size === 1) { // Se for exatamente a primeira mensagem do utilizador
            const settings = (await db.query('SELECT tickets_ai_assistant_enabled, tickets_ai_assistant_prompt FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
            
            if (settings && settings.tickets_ai_assistant_enabled) {
                await message.channel.sendTyping();
                const aiResponse = await getAIResponse(message.content, settings.tickets_ai_assistant_prompt);
                
                if (aiResponse) {
                    await message.channel.send(`🤖 **Assistente BasicFlow:**\n${aiResponse}`);
                }
            }
        }
    }
});


client.login(process.env.DISCORD_TOKEN);