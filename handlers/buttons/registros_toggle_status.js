// handlers/buttons/registros_toggle_status.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'registros_toggle_status',
    async execute(interaction) {
        await db.query(`UPDATE guild_settings SET registros_status = NOT COALESCE(registros_status, true) WHERE guild_id = $1`, [interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateRegistrosMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};