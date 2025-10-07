// Crie em: handlers/buttons/mod_toggle_monitor.js
const db = require('../../database.js');
const generateModeracaoPremiumHub = require('../../ui/moderacaoPremiumHub.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_toggle_monitor',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE guild_settings SET mod_monitor_enabled = NOT COALESCE(mod_monitor_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        await interaction.editReply({
            components: generateModeracaoPremiumHub(settings),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};