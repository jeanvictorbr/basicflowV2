// handlers/selects/select_registros_canal_aprovacoes.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/flags.js');

module.exports = {
    customId: 'select_registros_canal_aprovacoes',
    async execute(interaction) {
        const channelId = interaction.values[0];
        await db.query(`UPDATE guild_settings SET registros_canal_aprovacoes = $1 WHERE guild_id = $2`, [channelId, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateRegistrosMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};