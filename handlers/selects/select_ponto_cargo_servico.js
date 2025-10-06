const db = require('../../database.js');
const generatePontoMenu = require('../../ui/pontoMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ponto_cargo_servico',
    async execute(interaction) {
        const roleId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET ponto_cargo_em_servico = $1 WHERE guild_id = $2`, [roleId, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generatePontoMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};