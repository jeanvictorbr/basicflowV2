// Crie em: handlers/selects/select_store_manage_stock.js
const db = require('../../database.js');
const generateStockMenu = require('../../ui/store/stockMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_manage_stock',
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.values[0];
        
        const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
        const stockItems = (await db.query('SELECT COUNT(*) as count FROM store_stock WHERE product_id = $1 AND is_claimed = false', [productId])).rows[0];

        await interaction.editReply({
            components: generateStockMenu(product, stockItems.count),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};