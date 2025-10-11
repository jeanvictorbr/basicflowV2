// Crie em: handlers/buttons/dev_toggle_bot_status.js
const db = require('../../database.js');
const generateDevMainMenu = require('../../ui/devPanel/mainMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_toggle_bot_status',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        await db.query("UPDATE bot_status SET bot_enabled = NOT COALESCE(bot_enabled, true) WHERE status_key = 'main'");

        const botStatus = (await db.query("SELECT * FROM bot_status WHERE status_key = 'main'")).rows[0];
        const totalGuilds = interaction.client.guilds.cache.size;
        const totalMembers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        await interaction.editReply({
            components: generateDevMainMenu(botStatus, { totalGuilds, totalMembers }),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};