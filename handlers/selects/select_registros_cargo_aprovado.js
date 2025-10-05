// handlers/selects/select_registros_cargo_aprovado.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_registros_cargo_aprovado',
    async execute(interaction) {
        const roleId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET registros_cargo_aprovado = $1 WHERE guild_id = $2`, [roleId, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateRegistrosMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};