// Crie em: handlers/selects/select_store_vitrine_category.js
const db = require('../../database.js');
const generateVitrineMenu = require('../../ui/store/vitrineMenu.js');

module.exports = {
    customId: 'select_store_vitrine_category',
    async execute(interaction) {
        await interaction.deferUpdate();
        const selectedCategoryId = interaction.values[0];

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 AND is_enabled = true', [interaction.guild.id])).rows;
        
        const vitrinePayload = generateVitrineMenu(settings, categories, products, selectedCategoryId, 0);

        await interaction.editReply(vitrinePayload);
    }
};