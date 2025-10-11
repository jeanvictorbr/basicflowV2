// Substitua o conteúdo em: handlers/buttons/store_cart_cancel_return.js
const db = require('../../database.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');

module.exports = {
    customId: 'store_cart_cancel_return',
    async execute(interaction) {
        await interaction.deferUpdate();

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const productsInCart = cart.products_json || [];
        const coupon = cart.coupon_id ? (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0] : null;

        const originalPanel = generateCartPanel(cart, productsInCart, settings, coupon);

        await interaction.editReply(originalPanel);
    }
};