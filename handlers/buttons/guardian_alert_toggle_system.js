// Crie em: handlers/buttons/guardian_alert_toggle_system.js
const db = require('../../database.js');
const generateGuardianAlertsHubMenu = require('../../ui/guardianAlertsHubMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_alert_toggle_system',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET guardian_ai_alert_enabled = NOT COALESCE(guardian_ai_alert_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateGuardianAlertsHubMenu(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};