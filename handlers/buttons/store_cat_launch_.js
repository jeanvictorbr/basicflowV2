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

            // --- CORREÇÃO CRÍTICA DE SEGURANÇA: ADICIONADO guild_id ---

            if (mode === 'add') {
                // Adicionar: Produtos da Guilda SEM Categoria
                countQuery = 'SELECT COUNT(*) FROM store_products WHERE guild_id = $1 AND category_id IS NULL';
                productsQuery = 'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND category_id IS NULL ORDER BY id ASC LIMIT $2 OFFSET 0';
                
                countParams = [interaction.guild.id];
                queryParams = [interaction.guild.id, ITEMS_PER_PAGE];
            } else {
                // Remover/Editar: Produtos da Guilda E desta Categoria
                // (Aqui já estava implícito pelo category_id ser único, mas reforçamos a segurança)
                countQuery = 'SELECT COUNT(*) FROM store_products WHERE guild_id = $1 AND category_id = $2';
                productsQuery = 'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND category_id = $2 ORDER BY id ASC LIMIT $3 OFFSET 0';
                
                countParams = [interaction.guild.id, categoryId];
                queryParams = [interaction.guild.id, categoryId, ITEMS_PER_PAGE];
            }
            
            const countRes = await db.query(countQuery, countParams);
            const totalItems = parseInt(countRes.rows[0].count);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

            const products = (await db.query(productsQuery, queryParams)).rows;

            const uiComponents = generateCategoryProductSelect(products, 0, totalPages, mode, categoryId);

            if (mode === 'add' && products.length === 0) {
                if (uiComponents[0] && uiComponents[0].components && uiComponents[0].components[0]) {
                    uiComponents[0].components[0].content = `> ⚠️ **Atenção:** Não há produtos "sem categoria" disponíveis para adicionar.\n> Crie novos produtos ou remova-os de outras categorias primeiro.`;
                }
            }

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