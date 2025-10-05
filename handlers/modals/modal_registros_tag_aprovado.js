// handlers/modals/modal_registros_tag_aprovado.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/flags.js');

module.exports = {
    customId: 'modal_registros_tag_aprovado',
    async execute(interaction) {
        const tag = interaction.fields.getTextInputValue('input_tag');
        await db.query(`UPDATE guild_settings SET registros_tag_aprovado = $1 WHERE guild_id = $2`, [tag, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateRegistrosMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};