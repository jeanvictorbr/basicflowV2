const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Carregador Dinâmico de Comandos ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

// --- Carregador Dinâmico de Handlers de Interação ---
// Mapeia cada custom_id para sua respectiva função de handler.
client.handlers = new Collection();
const handlersPath = path.join(__dirname, 'handlers');
['buttons', 'modals', 'selects'].forEach(handlerType => {
    const handlerFiles = fs.readdirSync(path.join(handlersPath, handlerType)).filter(file => file.endsWith('.js'));
    for (const file of handlerFiles) {
        const handler = require(path.join(handlersPath, handlerType, file));
        // A chave é o custom_id, o valor é a função 'execute'.
        client.handlers.set(handler.customId, handler.execute);
    }
});


// --- Evento de Bot Pronto ---
client.once(Events.ClientReady, async () => {
    await db.initializeDatabase();
    console.log(`Pronto! Logado como ${client.user.tag}`);
});

// --- Listener de Interações Simplificado ---
// Agora ele apenas encontra e executa o handler correto.
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
        // Encontra o handler baseado no customId da interação (seja botão, modal ou select)
        const handler = client.handlers.get(interaction.customId);
        if (!handler) {
            console.warn(`Nenhum handler encontrado para o custom_id: ${interaction.customId}`);
            try {
                // Responde discretamente sem quebrar a aplicação
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.reply({ content: 'Este botão não tem uma função definida no momento.', ephemeral: true });
                }
            } catch (error) {
                console.error('Erro ao responder sobre handler não encontrado:', error);
            }
            return;
        }
        
        try {
            // Executa o handler encontrado
            await handler(interaction, client);
        } catch (error) {
            console.error(`Erro executando handler para ${interaction.customId}:`, error);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);