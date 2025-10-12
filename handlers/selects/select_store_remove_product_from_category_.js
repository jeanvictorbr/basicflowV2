// Crie em: handlers/selects/select_store_remove_product_from_category_.js
const db = require('../../database.js');
const manageCategoryProductsHandler = require('../buttons/store_manage_category_products_.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');

module.exports = {
    customId: 'select_store_remove_product_from_category_',
    async execute(interaction) {
        // CORREÇÃO: O índice correto para o ID da categoria é 6
        const categoryId = interaction.customId.split('_')[6];
        const productIds = interaction.values;

        await db.query(
            'UPDATE store_products SET category_id = NULL WHERE guild_id = $1 AND id = ANY($2::int[])',
            [interaction.guild.id, productIds]
        );

        // Recarrega o menu de gerenciamento da categoria
        interaction.customId = `store_manage_category_products_${categoryId}`;
        await manageCategoryProductsHandler.execute(interaction);
        
        // Atualiza a vitrine principal
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};