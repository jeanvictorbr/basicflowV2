// File: handlers/selects/select_store_add_product_to_category_.js
const db = require('../../database.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const manageCategoryProductsHandler = require('../buttons/store_manage_category_products_.js'); 

module.exports = {
    customId: 'select_store_add_product_to_category_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const categoryId = interaction.customId.split('_').pop();
        const productIds = interaction.values;

        try {
            // 1. Vincular (Update)
            await db.query(
                'UPDATE store_products SET category_id = $1 WHERE guild_id = $2 AND id = ANY($3::int[])',
                [categoryId, interaction.guild.id, productIds]
            );

            // 2. Atualizar Vitrine
            try {
                await updateStoreVitrine(interaction.client, interaction.guild.id, categoryId);
            } catch (e) { console.error(e); }

            // 3. RECARREGAR O MENU
            interaction.customId = `store_manage_category_products_${categoryId}`;
            await manageCategoryProductsHandler.execute(interaction);

        } catch (error) {
            console.error(error);
            if (!interaction.replied) await interaction.followUp({ content: "❌ Erro ao adicionar.", ephemeral: true });
        }
    }
};