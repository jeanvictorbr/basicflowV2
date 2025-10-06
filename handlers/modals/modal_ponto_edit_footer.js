const db = require('../../database.js');
const generatePontoPremiumMenu = require('../../ui/pontoPremiumMenu.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_ponto_edit_footer',
    async execute(interaction) {
        const footerText = interaction.fields.getTextInputValue('input_footer');
        await db.query(`UPDATE guild_settings SET ponto_vitrine_footer = $1 WHERE guild_id = $2`, [footerText, interaction.guild.id]);
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        await interaction.update({ components: generatePontoPremiumMenu(settings), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};