// Substitua o conteúdo em: handlers/modals/modal_store_add_product.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_add_product',
    async execute(interaction) {
        await interaction.deferUpdate();

        const name = interaction.fields.getTextInputValue('input_name');
        const price = parseFloat(interaction.fields.getTextInputValue('input_price').replace(',', '.'));
        const description = interaction.fields.getTextInputValue('input_desc') || null;
        const stockType = interaction.fields.getTextInputValue('input_stock_type').toUpperCase();

        if (isNaN(price)) {
            return interaction.followUp({ content: '❌ O preço deve ser um número válido.', ephemeral: true });
        }
        if (stockType !== 'REAL' && stockType !== 'GHOST') {
            return interaction.followUp({ content: '❌ Tipo de estoque inválido. Use "REAL" ou "GHOST".', ephemeral: true });
        }

        const stockCount = stockType === 'REAL' ? 0 : -1;

        // Query ajustada para não incluir os campos removidos
        await db.query(
            'INSERT INTO store_products (guild_id, name, price, description, stock_type, stock) VALUES ($1, $2, $3, $4, $5, $6)',
            [interaction.guild.id, name, price, description, stockType, stockCount]
        );

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Produto adicionado com sucesso!', ephemeral: true });
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};