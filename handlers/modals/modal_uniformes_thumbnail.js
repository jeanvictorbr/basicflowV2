// Crie em: handlers/modals/modal_uniformes_thumbnail.js
const db = require('../../database.js');
const generateUniformesMenu = require('../../ui/uniformesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'modal_uniformes_thumbnail',
    async execute(interaction) {
        const imageUrl = interaction.fields.getTextInputValue('input_url');
        await db.query(`UPDATE guild_settings SET uniformes_thumbnail_url = $1 WHERE guild_id = $2`, [imageUrl, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateUniformesMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};