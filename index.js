const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
require('dotenv').config();
const db = require('./database.js'); // Importa nosso gerenciador de banco de dados

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.once(Events.ClientReady, async () => {
    // Inicializa o banco de dados quando o bot fica online
    await db.initializeDatabase();
    console.log(`Pronto! Logado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        // ... (seu handler de comandos continua igual)
    }
    
    else if (interaction.isButton()) {
        const customId = interaction.customId;
        const guildId = interaction.guild.id;

        // Pega as configurações do banco de dados para este servidor
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        const settings = settingsResult.rows[0] || {}; // Usa um objeto vazio se não houver configs

        // --- NAVEGAÇÃO ---
        if (customId === '91e0639b02934906d94100b10afbfaa8') { // Botão "Abrir" Ausências
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            const ausenciasMenuComponents = generateAusenciasMenu(settings); // Passa as configs do DB
            await interaction.update({ components: ausenciasMenuComponents });
        }
        else if (customId === 'main_menu_back') { // Botão "Voltar"
            const mainMenuComponents = require('./ui/mainMenu.js');
            await interaction.update({ components: mainMenuComponents });
        }
        
        // --- BOTÕES "ALTERAR" (ABREM MODAIS) ---
        else if (customId === 'ausencia_set_canal_aprovacoes') {
            const modal = new ModalBuilder().setCustomId('modal_ausencia_canal_aprovacoes').setTitle('Configurar Canal de Aprovações');
            const input = new TextInputBuilder().setCustomId('input_canal').setLabel('ID ou menção do novo canal').setStyle(TextInputStyle.Short).setPlaceholder(settings.ausencias_canal_aprovacoes || 'Nenhum canal definido').setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
        // Adicione aqui a lógica para abrir os outros modais (cargo, logs, etc.)
    }
    
    else if (interaction.isModalSubmit()) {
        const customId = interaction.customId;
        const guildId = interaction.guild.id;

        if (customId === 'modal_ausencia_canal_aprovacoes') {
            const novoCanal = interaction.fields.getTextInputValue('input_canal');

            // 1. SALVA NO BANCO DE DADOS (UPSERT: Insere se não existir, atualiza se existir)
            await db.query(
                `INSERT INTO guild_settings (guild_id, ausencias_canal_aprovacoes) 
                 VALUES ($1, $2) 
                 ON CONFLICT (guild_id) 
                 DO UPDATE SET ausencias_canal_aprovacoes = $2`,
                [guildId, novoCanal]
            );

            // 2. RECARREGA O MENU COM A NOVA INFORMAÇÃO DO BANCO
            const newSettingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
            const newSettings = newSettingsResult.rows[0];
            
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            const updatedMenu = generateAusenciasMenu(newSettings);
            await interaction.update({ components: updatedMenu });
        }
        // Adicione aqui a lógica para salvar os dados dos outros modais
    }
});

client.login(process.env.DISCORD_TOKEN);