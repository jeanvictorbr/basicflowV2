const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
require('dotenv').config();
const db = require('./database.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// --- Carregador de Comandos (sem alterações) ---
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

// --- Evento de Bot Pronto (sem alterações) ---
client.once(Events.ClientReady, async () => {
    await db.initializeDatabase();
    console.log(`Pronto! Logado como ${client.user.tag}`);
});


// --- CÉREBRO DO BOT: LISTENER DE INTERAÇÕES (ATUALIZADO) ---
client.on(Events.InteractionCreate, async interaction => {
    const guildId = interaction.guild.id;
    
    // Função auxiliar para buscar as configurações do DB
    async function getSettings() {
        const result = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        return result.rows[0] || {};
    }

    // --- A. Handler para Comandos de Barra (/) ---
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }
    
    // --- B. Handler para Cliques em Botões ---
    else if (interaction.isButton()) {
        const customId = interaction.customId;
        const settings = await getSettings();

        // Carrega os designs dos menus
        const mainMenuComponents = require('./ui/mainMenu.js');
        const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
        const { ticketsMenuEmbed } = require('./ui/ticketsMenu.js'); // Note que este é um embed + components

        // --- NAVEGAÇÃO ---
        if (customId === 'open_ausencias_menu') {
            await interaction.update({ components: generateAusenciasMenu(settings) });
        } 
        else if (customId === 'open_tickets_menu') {
            // .update() espera um objeto com embeds e/ou components, o ticketsMenuEmbed já está nesse formato.
            await interaction.update(ticketsMenuEmbed);
        }
        else if (customId === 'main_menu_back' || customId === 'back_to_main_config') {
            await interaction.update({ embeds: [], components: mainMenuComponents });
        }

        // --- BOTÕES "ALTERAR" DO MENU DE AUSÊNCIAS (AGORA USAM .update()) ---
        else if (customId === 'ausencia_set_canal_aprovacoes' || customId === 'ausencia_set_canal_logs') {
            const channels = interaction.guild.channels.cache
                .filter(c => c.type === ChannelType.GuildText)
                .map(c => ({ label: `#${c.name}`, value: c.id }))
                .slice(0, 25);

            if (channels.length === 0) {
                return interaction.reply({ content: 'Não há canais de texto neste servidor para selecionar.', ephemeral: true });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`select_menu_${customId}`)
                .setPlaceholder('Selecione um canal da lista')
                .addOptions(channels);
            
            const cancelButton = new ButtonBuilder()
                .setCustomId('open_ausencias_menu') // O botão "Cancelar" simplesmente reabre o menu de ausências
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary);

            // AQUI ESTÁ A MUDANÇA: usamos .update() para transformar o painel no menu de seleção
            await interaction.update({
                embeds: [], // Limpa os embeds se houver
                components: [
                    new ActionRowBuilder().addComponents(selectMenu),
                    new ActionRowBuilder().addComponents(cancelButton)
                ]
            });
        }
        else if (customId === 'ausencia_set_cargo') {
             const roles = interaction.guild.roles.cache
                .filter(r => r.name !== '@everyone') // Remove o @everyone
                .map(r => ({ label: r.name, value: r.id }))
                .slice(0, 25);

            if (roles.length === 0) {
                return interaction.reply({ content: 'Não há cargos neste servidor para selecionar.', ephemeral: true });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_menu_ausencia_set_cargo')
                .setPlaceholder('Selecione um cargo da lista')
                .addOptions(roles);
            
            const cancelButton = new ButtonBuilder()
                .setCustomId('open_ausencias_menu')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary);

            await interaction.update({
                embeds: [],
                components: [
                    new ActionRowBuilder().addComponents(selectMenu),
                    new ActionRowBuilder().addComponents(cancelButton)
                ]
            });
        }
        // Placeholder para botões futuros, evitando o crash
        else {
             await interaction.reply({ content: 'Este botão ainda não foi configurado.', ephemeral: true });
        }
    }
    
    // --- C. Handler para Menus de Seleção (ATUALIZADO) ---
    else if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        const selectedValue = interaction.values[0];

        let dbColumn = '';
        if (customId === 'select_menu_ausencia_set_canal_aprovacoes') dbColumn = 'ausencias_canal_aprovacoes';
        if (customId === 'select_menu_ausencia_set_canal_logs') dbColumn = 'ausencias_canal_logs';
        if (customId === 'select_menu_ausencia_set_cargo') dbColumn = 'ausencias_cargo_ausente';

        if (dbColumn) {
            // 1. Salva a nova configuração no banco de dados
            await db.query(
                `INSERT INTO guild_settings (guild_id, ${dbColumn}) VALUES ($1, $2)
                 ON CONFLICT (guild_id) DO UPDATE SET ${dbColumn} = $2`,
                [guildId, selectedValue]
            );

            // 2. Busca as configurações ATUALIZADAS do banco
            const newSettings = await getSettings();
            
            // 3. Redesenha o menu de ausências com os novos dados
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            const updatedMenu = generateAusenciasMenu(newSettings);

            // 4. ATUALIZA A MENSAGEM para voltar ao painel, agora com o valor novo
            await interaction.update({ components: updatedMenu });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);