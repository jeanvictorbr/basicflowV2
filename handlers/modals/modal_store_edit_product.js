// Crie em: handlers/modals/modal_store_edit_product.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js'); // IMPORTA A FUNÇÃO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_product_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.customId.split('_')[4];

        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseFloat(interaction.fields.getTextInputValue('input_price').replace(',', '.'));
        const description = interaction.fields.getTextInputValue('input_desc') || null;
        const role_id_to_grant = interaction.fields.getTextInputValue('input_role_id') || null;
        const stock = parseInt(interaction.fields.getTextInputValue('input_stock'), 10);

        if (isNaN(price) || isNaN(stock)) {
            return interaction.followUp({ content: '❌ Preço e Estoque devem ser números válidos.', ephemeral: true });
        }

        await db.query(
            'UPDATE store_products SET name = $1, price = $2, description = $3, role_id_to_grant = $4, stock = $5 WHERE id = $6 AND guild_id = $7',
            [name, price, description, role_id_to_grant, stock, productId, interaction.guild.id]
        );

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });

        // CHAMA A FUNÇÃO PARA ATUALIZAR A VITRINE
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};