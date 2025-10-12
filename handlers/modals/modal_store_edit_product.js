// Substitua o conteúdo em: handlers/modals/modal_store_edit_product.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_product_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.customId.split('_')[4];

        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseFloat(interaction.fields.getTextInputValue('input_price').replace(',', '.'));
        const description = interaction.fields.getTextInputValue('input_desc') || null;
        const stock = parseInt(interaction.fields.getTextInputValue('input_stock'), 10);

        if (isNaN(price) || isNaN(stock)) {
            return interaction.followUp({ content: '❌ Preço e Estoque devem ser números válidos.', ephemeral: true });
        }

        // QUERY CORRIGIDA: Removida a tentativa de atualizar campos que não existem mais no modal.
        await db.query(
            'UPDATE store_products SET name = $1, price = $2, description = $3, stock = $4 WHERE id = $5 AND guild_id = $6',
            [name, price, description, stock, productId, interaction.guild.id]
        );

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};