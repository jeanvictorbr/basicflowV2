// index.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Carregador de Comandos ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
    }
}

// --- Carregador de Handlers (À PROVA DE FALHAS) ---
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
                console.error(`Erro ao carregar handler ${file}:`, error);
            }
        }
    }
});

// --- Evento de Bot Pronto ---
client.once(Events.ClientReady, async () => {
    await db.initializeDatabase();
    console.log(`Pronto! Logado como ${client.user.tag}`);
});

// --- Listener de Interações Simplificado ---
client.on(Events.InteractionCreate, async interaction => {
    // A linha que causava o erro foi removida daqui.

    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Erro executando comando:', error);
        }
    } else {
        // Esta é a lógica correta que já estava funcionando
        const handler = client.handlers.get(interaction.customId);
        if (!handler) {
            console.warn(`Nenhum handler encontrado para o custom_id: ${interaction.customId}`);
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: 'Este botão não tem uma função definida no momento.', ephemeral: true });
                }
            } catch (e) { /* Ignora */ }
            return;
        }
        
        try {
            await handler(interaction, client);
        } catch (error) {
            console.error(`Erro executando handler para ${interaction.customId}:`, error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);