const db = require('../../database.js');
const generatePontoMenu = require('../../ui/pontoMenu.js');
const isPremiumActive = require('../../utils/premiumCheck.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_premium_menu_back',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const isPremium = await isPremiumActive(interaction.guild.id);
        await interaction.update({
            components: generatePontoMenu(settings, isPremium),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};