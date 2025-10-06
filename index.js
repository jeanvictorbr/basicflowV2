// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Adiciona os gerenciadores de timers para o Bate-Ponto
client.pontoIntervals = new Map();
client.afkCheckTimers = new Map();
client.afkToleranceTimers = new Map();

// Carregador de Comandos
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    }
}

// Carregador de Handlers
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

// Evento de Bot Pronto
client.once(Events.ClientReady, async () => {
    await db.initializeDatabase();
    console.log(`🚀 Bot online! Logado como ${client.user.tag}`);
});

// Listener de Interações
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
        // Lógica aprimorada para handlers com IDs dinâmicos
        let handler;
        if (interaction.customId.startsWith('modal_uniformes_edit_')) {
            handler = client.handlers.get('modal_uniformes_edit_');
        } else if (interaction.customId.startsWith('uniform_copy_preset_')) {
            handler = client.handlers.get('uniform_copy_preset_');
        } else if (interaction.customId.startsWith('ranking_page_')) {
            handler = client.handlers.get('ranking_page_');
        } else if (interaction.customId.startsWith('select_ticket_department_role_')) {
            handler = client.handlers.get('select_ticket_department_role_');
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

client.login(process.env.DISCORD_TOKEN);