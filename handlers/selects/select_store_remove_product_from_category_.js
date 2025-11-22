// File: handlers/selects/select_store_remove_product_from_category_.js
// (Nota: O nome do arquivo no disco deve ser o mesmo que você usou antes, mas o customId é select_store_cat_unlink_)
const db = require('../../database.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const manageCategoryProductsHandler = require('../buttons/store_manage_category_products_.js'); 

module.exports = {
    customId: 'select_store_cat_unlink_', 
    async execute(interaction) {
        // Defer Update para não travar o menu
        await interaction.deferUpdate();

        const categoryId = interaction.customId.split('_')[4]; 
        const productIds = interaction.values;

        try {
            // 1. Desvincular (Update)
            await db.query(
                'UPDATE store_products SET category_id = NULL WHERE guild_id = $1 AND id = ANY($2::int[])',
                [interaction.guild.id, productIds]
            );

            // 2. Atualizar Vitrine (Silencioso)
            try {
                await updateStoreVitrine(interaction.client, interaction.guild.id, categoryId);
            } catch (e) { console.error(e); }

            // 3. RECARREGAR O MENU (Crucial para não travar)
            // Alteramos o customId para simular que o botão de gerenciar foi clicado novamente
            interaction.customId = `store_manage_category_products_${categoryId}`;
            
            // Chamamos o handler do botão para redesenhar a tela
            await manageCategoryProductsHandler.execute(interaction);

        } catch (error) {
            console.error("Erro ao desvincular:", error);
            // Caso dê erro fatal, avisamos
            if (!interaction.replied) await interaction.followUp({ content: "❌ Erro ao atualizar.", ephemeral: true });
        }
    }
};