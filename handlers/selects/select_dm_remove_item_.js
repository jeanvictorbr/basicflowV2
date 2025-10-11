// Crie em: handlers/selects/select_dm_remove_item_.js
const db = require('../../database.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');
const { updateCartActivity } = require('../../utils/storeInactivityMonitor.js');

module.exports = {
    customId: 'select_dm_remove_item_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const [, , , guildId, cartId] = interaction.customId.split('_');
        const indexToRemove = parseInt(interaction.values[0], 10);

        const cartResult = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId]);
        const cart = cartResult.rows[0];
        let products = cart.products_json || [];

        if (indexToRemove >= 0 && indexToRemove < products.length) {
            products.splice(indexToRemove, 1);
        }

        if (cart.coupon_id) {
            const coupon = (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0];
            let originalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
            const discountAmount = originalPrice * (coupon.discount_percent / 100);
            cart.total_price = originalPrice - discountAmount;
        } else {
            cart.total_price = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        }
        
        await db.query('UPDATE store_carts SET products_json = $1::jsonb, total_price = $2 WHERE channel_id = $3', [JSON.stringify(products), cart.total_price, cartId]);
        await updateCartActivity(cartId);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const coupon = cart.coupon_id ? (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0] : null;
        
        const updatedCart = { ...cart, products_json: products };
        const updatedPanel = generateCartPanel(updatedCart, products, settings, coupon);

        await interaction.editReply({ content: '✅ Item removido com sucesso!', components: [] });
        await interaction.message.edit(updatedPanel);
    }
};