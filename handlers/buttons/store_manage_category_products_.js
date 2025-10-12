// Crie em: handlers/buttons/store_manage_category_products_.js
const db = require('../../database.js');
const generateManageCategoryProductsMenu = require('../../ui/store/manageCategoryProductsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_category_products_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categoryId = interaction.customId.split('_')[4];

        const category = (await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId])).rows[0];
        if (!category) {
            return interaction.followUp({ content: 'Categoria não encontrada.', ephemeral: true });
        }

        const assignedProducts = (await db.query('SELECT id, name FROM store_products WHERE guild_id = $1 AND category_id = $2', [interaction.guild.id, categoryId])).rows;
        const unassignedProducts = (await db.query('SELECT id, name FROM store_products WHERE guild_id = $1 AND category_id IS NULL', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateManageCategoryProductsMenu(category, assignedProducts, unassignedProducts),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};