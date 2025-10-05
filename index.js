const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, StringSelectMenuBuilder, ChannelType } = require('discord.js');
require('dotenv').config();
const db = require('./database.js');

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
    await db.initializeDatabase();
    console.log(`Pronto! Logado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    const guildId = interaction.guild.id;
    
    // Função para buscar as configurações do DB
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
            await interaction.reply({ content: 'Ocorreu um erro ao executar este comando!', ephemeral: true });
        }
    }
    
    // --- B. Handler para Cliques em Botões ---
    else if (interaction.isButton()) {
        const customId = interaction.customId;

        // --- NAVEGAÇÃO ENTRE MENUS ---
        if (customId === 'open_ausencias_menu') {
            const settings = await getSettings();
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            await interaction.update({ components: generateAusenciasMenu(settings) });
        } 
        else if (customId === 'open_tickets_menu') {
            // Carrega a interface estática do menu de tickets
            const { ticketsMenuEmbed } = require('./ui/ticketsMenu.js');
            await interaction.update(ticketsMenuEmbed); // .update espera um objeto com embeds e/ou components
        }
        else if (customId === 'main_menu_back' || customId === 'back_to_main_config') {
            const mainMenuComponents = require('./ui/mainMenu.js');
            await interaction.update({ components: mainMenuComponents });
        }

        // --- BOTÕES "ALTERAR" DO MENU DE AUSÊNCIAS (AGORA ABREM MENUS DE SELEÇÃO) ---
        else if (customId === 'ausencia_set_canal_aprovacoes' || customId === 'ausencia_set_canal_logs') {
            const channels = interaction.guild.channels.cache
                .filter(c => c.type === ChannelType.GuildText)
                .map(c => ({ label: c.name, value: c.id }))
                .slice(0, 25); // Limite de 25 opções

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId(`select_menu_${customId}`) // ID dinâmico para sabermos o que configurar
                .setPlaceholder('Selecione um canal')
                .addOptions(channels);
            
            await interaction.reply({
                content: `Selecione abaixo o novo canal para **${customId.includes('aprovacoes') ? 'Aprovações de Ausência' : 'Logs de Ausência'}**:`,
                components: [new ActionRowBuilder().addComponents(selectMenu)],
                ephemeral: true
            });
        }
        else if (customId === 'ausencia_set_cargo') {
             const roles = interaction.guild.roles.cache
                .map(r => ({ label: r.name, value: r.id }))
                .slice(1, 26); // Remove @everyone e limita a 25

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_menu_ausencia_set_cargo')
                .setPlaceholder('Selecione um cargo')
                .addOptions(roles);

            await interaction.reply({
                content: 'Selecione abaixo o novo **Cargo para Ausentes**:',
                components: [new ActionRowBuilder().addComponents(selectMenu)],
                ephemeral: true
            });
        }
        // Adicione aqui placeholders para os botões não implementados para evitar falhas
        else {
             await interaction.reply({ content: 'Este botão ainda não foi configurado.', ephemeral: true });
        }
    }
    
    // --- C. Handler para Menus de Seleção ---
    else if (interaction.isStringSelectMenu()) {
        const customId = interaction.customId;
        const selectedValue = interaction.values[0];

        let dbColumn = '';
        if (customId === 'select_menu_ausencia_set_canal_aprovacoes') dbColumn = 'ausencias_canal_aprovacoes';
        if (customId === 'select_menu_ausencia_set_canal_logs') dbColumn = 'ausencias_canal_logs';
        if (customId === 'select_menu_ausencia_set_cargo') dbColumn = 'ausencias_cargo_ausente';

        if (dbColumn) {
            await db.query(
                `INSERT INTO guild_settings (guild_id, ${dbColumn}) VALUES ($1, $2)
                 ON CONFLICT (guild_id) DO UPDATE SET ${dbColumn} = $2`,
                [guildId, selectedValue]
            );

            // Responde ao usuário que a seleção funcionou e deleta a mensagem do menu
            await interaction.reply({ content: `✅ Configuração salva com sucesso! O novo valor é <#${selectedValue}>.`, ephemeral: true });
            
            // ATUALIZA O MENU ORIGINAL EM TEMPO REAL
            // 1. Pega a mensagem original do painel
            const originalMessage = await interaction.channel.messages.fetch(interaction.message.reference.messageId);
            // 2. Pega as configs atualizadas
            const newSettings = await getSettings();
            // 3. Redesenha o menu de ausências
            const generateAusenciasMenu = require('./ui/ausenciasMenu.js');
            // 4. Edita a mensagem original com o menu atualizado
            await originalMessage.edit({ components: generateAusenciasMenu(newSettings) });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);