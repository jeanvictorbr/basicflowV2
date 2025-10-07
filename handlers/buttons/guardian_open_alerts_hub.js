// Crie em: handlers/buttons/guardian_open_alerts_hub.js
const db = require('../../database.js');
const generateGuardianAlertsHubMenu = require('../../ui/guardianAlertsHubMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_open_alerts_hub',
    async execute(interaction) {
        await interaction.deferUpdate();
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAlertsHubMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};