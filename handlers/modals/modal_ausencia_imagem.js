const db = require('../../database.js');
const generateAusenciasMenu = require('../../ui/ausenciasMenu.js');
module.exports = {
    customId: 'modal_ausencia_imagem',
    async execute(interaction) {
        const imageUrl = interaction.fields.getTextInputValue('input_url');
        await db.query(`UPDATE guild_settings SET ausencias_imagem_vitrine = $1 WHERE guild_id = $2`, [imageUrl, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateAusenciasMenu(settingsResult.rows[0]) });
    }
};