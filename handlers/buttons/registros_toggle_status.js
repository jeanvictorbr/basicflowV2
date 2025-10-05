// handlers/buttons/registros_toggle_status.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/flags.js');

module.exports = {
    customId: 'registros_toggle_status',
    async execute(interaction) {
        await db.query(`UPDATE guild_settings SET registros_status = NOT registros_status WHERE guild_id = $1`, [interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateRegistrosMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};