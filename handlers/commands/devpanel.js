// Substitua o conteúdo em: handlers/commands/devpanel.js
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'devpanel',
    async execute(interaction) {
        // --- VERIFICAÇÃO DE SEGURANÇA RESTAURADA ---
        if (interaction.user.id !== process.env.DEV_USER_ID) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        
        // Garante que a linha de status exista
        await db.query("INSERT INTO bot_status (status_key, ai_services_enabled) VALUES ('main', true) ON CONFLICT (status_key) DO NOTHING");
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        
        // Coleta de estatísticas globais
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        await interaction.reply({
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};