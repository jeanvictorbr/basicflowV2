const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, StringSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
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
    if (!interaction.guild) return; // Garante que a interação ocorra em um servidor
    const guildId = interaction.guild.id;
    
    // Função auxiliar para buscar as configurações do DB
    async function getSettings() {
        const result = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId]);
        // Garante que a guild tenha uma linha no DB
        if (result.rows.length === 0) {
            await db.query('INSERT INTO guild_settings (guild_id) VALUES ($1)', [guildId]);
            return { guild_id: guildId };
        }
        return result.rows[0];
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
        const generateRegistrosMenu = require('./ui/registrosMenu.js'); // Exemplo
        const { ticketsMenuEmbed } = require('./ui/ticketsMenu.js'); 

        // --- NAVEGAÇÃO ENTRE MENUS ---
        if (customId === 'main_menu_back' || customId === 'back_to_main_config') {
            return await interaction.update({ embeds: [], components: mainMenuComponents });
        }
        if (customId === 'open_ausencias_menu') {
            return await interaction.update({ components: generateAusenciasMenu(settings) });
        }
        if (customId === 'open_registros_menu') {
            return await interaction.update({ components: generateRegistrosMenu(settings) });
        } 
        if (customId === 'open_tickets_menu') {
            return await interaction.update(ticketsMenuEmbed);
        }
        
        // --- BOTÕES "ALTERAR" (ABREM MENUS DE SELEÇÃO) ---
        if (customId.startsWith('ausencia_set_')) {
            let options, placeholder, selectMenuId;
            const target = customId.split('_').pop(); // 'canal', 'cargo', etc.

            if (target === 'canal' || target === 'logs') { // Reutilizado para ambos os canais
                options = interaction.guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildText)
                    .map(c => ({ label: `#${c.name}`, value: c.id }))
                    .slice(0, 25);
                placeholder = 'Selecione um canal';
                selectMenuId = `select_menu_ausencia_${target}`;
            } else if (target === 'cargo') {
                options = interaction.guild.roles.cache
                    .filter(r => r.name !== '@everyone')
                    .map(r => ({ label: r.name, value: r.id }))
                    .slice(0, 25);
                placeholder = 'Selecione um cargo';
                selectMenuId = 'select_menu_ausencia_cargo';
            }

            if (options && options.length > 0) {
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(selectMenuId)
                    .setPlaceholder(placeholder)
                    .addOptions(options);
                
                const cancelButton = new ButtonBuilder().setCustomId('open_ausencias_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

                // A LÓGICA CORRETA: edita a mensagem atual para mostrar o menu de seleção
                return await interaction.update({
                    embeds: [],
                    components: [
                        new ActionRowBuilder().addComponents(selectMenu),
                        new ActionRowBuilder().addComponents(cancelButton)
                    ]
                });
            } else {
                 return await interaction.reply({ content: 'Não há opções disponíveis para selecionar.', ephemeral: true });
            }
        }
        
        // HANDLER GERAL PARA BOTÕES NÃO IMPLEMENTADOS (EVITA CRASH)
        await interaction.reply({ content: 'Este botão ainda não tem uma função definida.', ephemeral: true });
    }
    
    // --- C. Handler para Menus de Seleção ---
    else if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        const selectedValue = interaction.values[0];

        let dbColumn = '';
        if (customId === 'select_menu_ausencia_canal') dbColumn = 'ausencias_canal_aprovacoes';
        if (customId === 'select_menu_ausencia_logs') dbColumn = 'ausencias_canal_logs';
        if (customId === 'select_menu_ausencia_cargo') dbColumn = 'ausencias_cargo_ausente';

        if (dbColumn) {
            // 1. Salva no DB
            await db.query(
                `UPDATE guild_settings SET ${dbColumn} = $1 WHERE guild_id = $2`,
                [selectedValue, guildId]
            );

            // 2. Busca configs atualizadas
            const newSettings = await getSettings();
            
            // 3. Redesenha o menu de ausências
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            
            // 4. ATUALIZA A MENSAGEM para voltar ao painel, com o valor novo
            await interaction.update({ components: generateAusenciasMenu(newSettings) });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);