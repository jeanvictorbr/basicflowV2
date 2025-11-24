// Substitua em: handlers/buttons/store_manage_category_products_.js
const db = require('../../database.js');
const generateCategoryManageHub = require('../../ui/store/categoryManageHub.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_category_products_',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        // Extrair ID da categoria (ex: store_manage_category_products_5)
        const categoryId = interaction.customId.split('_').pop();

        try {
            // 1. Buscar Categoria
            const category = (await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId])).rows[0];
            
            if (!category) {
                return interaction.editReply({ content: '❌ Categoria não encontrada.', components: [] });
            }

            // 2. Contar produtos nela
            const countRes = await db.query('SELECT COUNT(*) FROM store_products WHERE category_id = $1', [categoryId]);
            const productCount = parseInt(countRes.rows[0].count);

            // 3. Mostrar Hub
            const uiComponents = generateCategoryManageHub(category, productCount);

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro ao gerir produtos da categoria:", error);
            await interaction.followUp({ content: '❌ Erro interno.', ephemeral: true });
        }
    }
};