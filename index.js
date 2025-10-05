const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Carregador de Comandos ---
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

// --- Evento de Bot Pronto ---
client.once(Events.ClientReady, async () => {
    await db.initializeDatabase();
    console.log(`Pronto! Logado como ${client.user.tag}`);
});


// --- CÉREBRO DO BOT: LISTENER DE INTERAÇÕES ---
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.guild) return;
    const guildId = interaction.guild.id;
    
    // Função auxiliar para buscar as configurações do DB
    async function getSettings() {
        // Garante que a guild tenha uma linha no DB antes de buscar
        await db.query('INSERT INTO guild_settings (guild_id) VALUES ($1) ON CONFLICT (guild_id) DO NOTHING', [guildId]);
        const result = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        return result.rows[0];
    }

    // --- A. Handler para Comandos de Barra (/) ---
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } 
        catch (error) { console.error(error); }
    }
    
    // --- B. Handler para Cliques em Botões ---
    else if (interaction.isButton()) {
        const customId = interaction.customId;
        const settings = await getSettings();

        // Carrega os designs dos menus
        const mainMenuComponents = require('./ui/mainMenu.js');
        const generateAusenciasMenu = require('./ui/ausenciasMenu.js');

        // --- NAVEGAÇÃO PRINCIPAL ---
        if (customId === 'main_menu_back') {
            return interaction.update({ embeds: [], components: mainMenuComponents });
        }
        if (customId === 'open_ausencias_menu') {
            return interaction.update({ components: generateAusenciasMenu(settings) });
        }
        
        // --- BOTÕES "ALTERAR" DO MENU DE AUSÊNCIAS ---
        const ausenciasPrefix = 'ausencia_set_';
        if (customId.startsWith(ausenciasPrefix)) {
            const target = customId.substring(ausenciasPrefix.length); // canal_aprovacoes, cargo, etc.
            
            // Lógica para abrir MODAL para a imagem
            if (target === 'imagem') {
                const modal = new ModalBuilder().setCustomId('modal_ausencia_imagem').setTitle('Alterar Imagem da Vitrine');
                const input = new TextInputBuilder().setCustomId('input_url').setLabel('URL da nova imagem').setStyle(TextInputStyle.Short).setPlaceholder('https://i.imgur.com/seu-link.png').setRequired(true);
                modal.addComponents(new ActionRowBuilder().addComponents(input));
                return interaction.showModal(modal);
            }

            // Lógica para abrir SELECT MENU para canais e cargos
            let options, placeholder, selectMenuId;
            if (target.includes('canal')) {
                options = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).map(c => ({ label: `#${c.name}`, value: c.id })).slice(0, 25);
                placeholder = 'Selecione um canal';
                selectMenuId = `select_menu_ausencia_${target}`;
            } else if (target === 'cargo') {
                options = interaction.guild.roles.cache.filter(r => r.name !== '@everyone').map(r => ({ label: r.name, value: r.id })).slice(0, 25);
                placeholder = 'Selecione um cargo';
                selectMenuId = 'select_menu_ausencia_cargo';
            }

            if (!options || options.length === 0) {
                return interaction.reply({ content: 'Não há opções disponíveis para selecionar.', ephemeral: true });
            }

            const selectMenu = new StringSelectMenuBuilder().setCustomId(selectMenuId).setPlaceholder(placeholder).addOptions(options);
            const cancelButton = new ButtonBuilder().setCustomId('open_ausencias_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

            return interaction.update({
                embeds: [],
                components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)]
            });
        }
        
        // --- Placeholder para outros botões ---
        await interaction.reply({ content: 'Este módulo ainda não foi configurado.', ephemeral: true });
    }
    
    // --- C. Handler para Menus de Seleção ---
    else if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        const selectedValue = interaction.values[0];

        let dbColumn = '';
        if (customId === 'select_menu_ausencia_canal_aprovacoes') dbColumn = 'ausencias_canal_aprovacoes';
        if (customId === 'select_menu_ausencia_canal_logs') dbColumn = 'ausencias_canal_logs';
        if (customId === 'select_menu_ausencia_cargo') dbColumn = 'ausencias_cargo_ausente';

        if (dbColumn) {
            await db.query(`UPDATE guild_settings SET ${dbColumn} = $1 WHERE guild_id = $2`, [selectedValue, guildId]);
            
            const newSettings = await getSettings();
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            await interaction.update({ components: generateAusenciasMenu(newSettings) });
        }
    }
    
    // --- D. Handler para Modais ---
    else if (interaction.isModalSubmit()) {
        const customId = interaction.customId;

        if (customId === 'modal_ausencia_imagem') {
            const imageUrl = interaction.fields.getTextInputValue('input_url');
            await db.query(`UPDATE guild_settings SET ausencias_imagem_vitrine = $1 WHERE guild_id = $2`, [imageUrl, guildId]);
            
            const newSettings = await getSettings();
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            await interaction.update({ components: generateAusenciasMenu(newSettings) });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);