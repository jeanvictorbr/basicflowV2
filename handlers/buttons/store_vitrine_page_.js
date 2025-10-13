// Crie em: handlers/buttons/store_vitrine_page_.js
const db = require('../../database.js');
const generateVitrineMenu = require('../../ui/store/vitrineMenu.js');

module.exports = {
    customId: 'store_vitrine_page_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const [,,, categoryId, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr, 10);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 AND is_enabled = true', [interaction.guild.id])).rows;
        
        const vitrinePayload = generateVitrineMenu(settings, categories, products, categoryId === 'none' ? null : categoryId, page);

        await interaction.editReply(vitrinePayload);
    }
};