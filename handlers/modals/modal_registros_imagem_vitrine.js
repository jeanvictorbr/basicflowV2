// Crie este arquivo em: handlers/modals/modal_registros_imagem_vitrine.js
const db = require('../../database.js');
const generateRegistrosMenu = require('../../ui/registrosMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_registros_imagem_vitrine',
    async execute(interaction) {
        const imageUrl = interaction.fields.getTextInputValue('input_imagem');
        await db.query(`UPDATE guild_settings SET registros_imagem_vitrine = $1 WHERE guild_id = $2`, [imageUrl, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateRegistrosMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};