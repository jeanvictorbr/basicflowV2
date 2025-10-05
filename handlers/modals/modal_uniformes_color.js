// Crie em: handlers/modals/modal_uniformes_color.js
const db = require('../../database.js');
const generateUniformesMenu = require('../../ui/uniformesMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'modal_uniformes_color',
    async execute(interaction) {
        const color = interaction.fields.getTextInputValue('input_color');
        if (!/^#[0-9A-F]{6}$/i.test(color)) {
            return interaction.reply({ content: 'Código de cor inválido. Use o formato Hex, por exemplo: `#FFFFFF`', ephemeral: true });
        }
        await db.query(`UPDATE guild_settings SET uniformes_color = $1 WHERE guild_id = $2`, [color, interaction.guild.id]);
        const settingsResult = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
        await interaction.update({ components: generateUniformesMenu(settingsResult.rows[0]), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};