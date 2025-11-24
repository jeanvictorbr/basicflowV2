// Substitua em: handlers/buttons/store_cat_launch_.js
const db = require('../../database.js');
const generateCategoryProductSelect = require('../../ui/store/categoryProductSelect.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_cat_launch_', 
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const parts = interaction.customId.replace('store_cat_launch_', '').split('_');
        const mode = parts[0]; // 'add', 'remove', 'edit'
        const categoryId = parts[1];

        const ITEMS_PER_PAGE = 25;

        try {
            let countQuery, productsQuery;
            let queryParams, countParams;

            if (mode === 'add') {
                // Produtos SEM categoria
                countQuery = 'SELECT COUNT(*) FROM store_products WHERE category_id IS NULL';
                productsQuery = 'SELECT id, name, price FROM store_products WHERE category_id IS NULL ORDER BY id ASC LIMIT $1 OFFSET 0';
                countParams = [];
                queryParams = [ITEMS_PER_PAGE];
            } else {
                // Modo 'remove' OU 'edit' (Produtos DESTA categoria)
                countQuery = 'SELECT COUNT(*) FROM store_products WHERE category_id = $1';
                productsQuery = 'SELECT id, name, price FROM store_products WHERE category_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0';
                countParams = [categoryId];
                queryParams = [categoryId, ITEMS_PER_PAGE];
            }
            
            const countRes = await db.query(countQuery, countParams);
            const totalItems = parseInt(countRes.rows[0].count);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

            const products = (await db.query(productsQuery, queryParams)).rows;

            const uiComponents = generateCategoryProductSelect(products, 0, totalPages, mode, categoryId);

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error(`Erro launcher cat ${mode}:`, error);
            await interaction.followUp({ content: '❌ Erro ao carregar lista.', ephemeral: true });
        }
    }
};