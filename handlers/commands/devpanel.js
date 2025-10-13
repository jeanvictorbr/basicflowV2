// Substitua o conteúdo em: handlers/commands/devpanel.js
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'devpanel',
    async execute(interaction) {
        if (interaction.user.id !== process.env.DEV_USER_ID) {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }
        
        if (interaction.isButton()) {
            await interaction.deferUpdate();
        } else {
            await interaction.deferReply({ ephemeral: true });
        }
        
        await db.query("INSERT INTO bot_status (status_key, ai_services_enabled) VALUES ('main', true) ON CONFLICT (status_key) DO NOTHING");
        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        const payload = {
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        };

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(payload);
        } else {
            await interaction.reply(payload);
        }
    }
};