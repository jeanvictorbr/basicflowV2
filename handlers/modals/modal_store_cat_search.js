// Crie em: handlers/modals/modal_store_cat_search.js
const db = require('../../database.js');
const generateCategoryProductSelect = require('../../ui/store/categoryProductSelect.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    // Captura IDs como: modal_store_cat_search_add_5
    customId: 'modal_store_cat_search_', 
    async execute(interaction) {
        await interaction.deferUpdate();

        // Parse do ID: modal_store_cat_search_MODE_CATID
        const parts = interaction.customId.replace('modal_store_cat_search_', '').split('_');
        const mode = parts[0];
        const categoryId = parts[1];
        
        const query = interaction.fields.getTextInputValue('query');

        try {
            let productsQuery;
            let queryParams;

            // Lógica de Busca Filtrada
            if (mode === 'add') {
                // Busca produtos SEM CATEGORIA que tenham esse nome
                productsQuery = `
                    SELECT id, name, price 
                    FROM store_products 
                    WHERE category_id IS NULL 
                    AND name ILIKE $1 
                    ORDER BY id ASC 
                    LIMIT 25
                `;
                queryParams = [`%${query}%`];
            } else {
                // (Remove ou Edit) Busca produtos DESTA CATEGORIA que tenham esse nome
                productsQuery = `
                    SELECT id, name, price 
                    FROM store_products 
                    WHERE category_id = $1 
                    AND name ILIKE $2 
                    ORDER BY id ASC 
                    LIMIT 25
                `;
                queryParams = [categoryId, `%${query}%`];
            }

            // Executa a busca
            const products = (await db.query(productsQuery, queryParams)).rows;

            // Gera a interface com o resultado da busca
            // (lista, pag 0, 1 total, mode, catId, isSearch=true, termo)
            const uiComponents = generateCategoryProductSelect(products, 0, 1, mode, categoryId, true, query);

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro na pesquisa de produtos da categoria:", error);
            await interaction.followUp({ content: '❌ Erro ao pesquisar.', ephemeral: true });
        }
    }
};