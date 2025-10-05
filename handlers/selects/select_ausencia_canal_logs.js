const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');
module.exports = {
    customId: 'select_ausencia_canal_logs',
    async execute(interaction) {
        const selectedValue = interaction.values[0];
        await db.query(`UPDATE guild_settings SET ausencias_canal_logs = $1 WHERE guild_id = $2`, [selectedValue, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateAusenciasMenu(settingsResult.rows[0]) });
    }
};