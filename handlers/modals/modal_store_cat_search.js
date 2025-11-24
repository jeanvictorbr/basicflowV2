// Substitua em: handlers/modals/modal_store_cat_search.js
const db = require('../../database.js');
const generateCategoryProductSelect = require('../../ui/store/categoryProductSelect.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_cat_search_', 
    async execute(interaction) {
        await interaction.deferUpdate();

        const parts = interaction.customId.replace('modal_store_cat_search_', '').split('_');
        const mode = parts[0];
        const categoryId = parts[1];
        
        const query = interaction.fields.getTextInputValue('query');

        try {
            let productsQuery;
            let queryParams;

            // --- CORREÇÃO CRÍTICA: ADICIONADO guild_id ---

            if (mode === 'add') {
                // Busca produtos SEM CATEGORIA da GUILDA ATUAL
                productsQuery = `
                    SELECT id, name, price 
                    FROM store_products 
                    WHERE guild_id = $1 
                    AND category_id IS NULL 
                    AND name ILIKE $2 
                    ORDER BY id ASC 
                    LIMIT 25
                `;
                queryParams = [interaction.guild.id, `%${query}%`];
            } else {
                // Busca produtos DESTA CATEGORIA da GUILDA ATUAL
                productsQuery = `
                    SELECT id, name, price 
                    FROM store_products 
                    WHERE guild_id = $1 
                    AND category_id = $2 
                    AND name ILIKE $3 
                    ORDER BY id ASC 
                    LIMIT 25
                `;
                queryParams = [interaction.guild.id, categoryId, `%${query}%`];
            }

            const products = (await db.query(productsQuery, queryParams)).rows;

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