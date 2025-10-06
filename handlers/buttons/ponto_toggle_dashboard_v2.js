// handlers/buttons/ponto_toggle_dashboard_v2.js
const db = require('../../database.js');
const generatePontoPremiumMenu = require('../../ui/pontoPremiumMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_toggle_dashboard_v2',
    async execute(interaction) {
        await db.query(`UPDATE guild_settings SET ponto_dashboard_v2_enabled = NOT COALESCE(ponto_dashboard_v2_enabled, false) WHERE guild_id = $1`, [interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        await interaction.update({ components: generatePontoPremiumMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};