// handlers/buttons/store_cart_finalize.js
const db = require('../../database.js');
const generatePaymentMenu = require('../../ui/store/paymentMenu.js');

module.exports = {
    customId: 'store_cart_finalize',
    async execute(interaction) {
        await interaction.deferUpdate();

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const productsInCart = cart.products_json || [];
        
        // Recalcula o preço final uma última vez para garantir consistência
        let finalPrice = productsInCart.reduce((sum, p) => sum + parseFloat(p.price), 0);
        let coupon = null;

        if (cart.coupon_id) {
            coupon = (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0];
            if (coupon) {
                finalPrice = finalPrice * (1 - (coupon.discount_percent / 100));
            }
        }
        
        // Atualiza o status e o preço final no banco de dados
        await db.query(
            `UPDATE store_carts SET status = 'payment', total_price = $1 WHERE channel_id = $2`, 
            [finalPrice.toFixed(2), interaction.channel.id]
        );

        const updatedCart = { ...cart, status: 'payment', total_price: finalPrice };
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        
        const paymentPanel = await generatePaymentMenu(updatedCart, settings, coupon, interaction.guild);

        await interaction.editReply(paymentPanel);
    }
};