// Substitua em: handlers/buttons/store_cat_pg_.js
const db = require('../../database.js');
const generateCategoryProductSelect = require('../../ui/store/categoryProductSelect.js');

module.exports = {
    customId: 'store_cat_pg_',
    async execute(interaction) {
        try {
            const parts = interaction.customId.replace('store_cat_pg_', '').split('_');
            const mode = parts[0];
            const categoryId = parts[1];
            let targetPage = parseInt(parts[2]);
            if (isNaN(targetPage) || targetPage < 0) targetPage = 0;

            const ITEMS_PER_PAGE = 25;
            const offset = targetPage * ITEMS_PER_PAGE;

            let countQuery, productsQuery, queryParams, countParams;

            // --- CORREÇÃO CRÍTICA: FILTRO POR GUILD_ID OBRIGATÓRIO ---

            if (mode === 'add') {
                countQuery = 'SELECT COUNT(*) FROM store_products WHERE guild_id = $1 AND category_id IS NULL';
                productsQuery = 'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND category_id IS NULL ORDER BY id ASC LIMIT $2 OFFSET $3';
                
                countParams = [interaction.guild.id];
                queryParams = [interaction.guild.id, ITEMS_PER_PAGE, offset];
            } else {
                // Remove e Edit
                countQuery = 'SELECT COUNT(*) FROM store_products WHERE guild_id = $1 AND category_id = $2';
                productsQuery = 'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND category_id = $2 ORDER BY id ASC LIMIT $3 OFFSET $4';
                
                countParams = [interaction.guild.id, categoryId];
                queryParams = [interaction.guild.id, categoryId, ITEMS_PER_PAGE, offset];
            }

            const countRes = await db.query(countQuery, countParams);
            const totalItems = parseInt(countRes.rows[0].count);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

            if (targetPage >= totalPages) targetPage = totalPages - 1;

            const products = (await db.query(productsQuery, queryParams)).rows;

            const uiComponents = generateCategoryProductSelect(products, targetPage, totalPages, mode, categoryId);

            await interaction.update({ components: uiComponents });

        } catch (error) {
            console.error("Erro paginação cat:", error);
            if(!interaction.replied) await interaction.reply({ content: 'Erro ao mudar página.', ephemeral: true });
        }
    }
};