// Substitua o conteúdo em: handlers/modals/modal_store_apply_coupon.js
const db = require('../../database.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');

module.exports = {
    customId: 'modal_store_apply_coupon',
    async execute(interaction) {
        await interaction.deferUpdate();

        const code = interaction.fields.getTextInputValue('input_coupon_code').toUpperCase();

        const couponResult = await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 AND code = $2 AND is_active = true AND uses_left > 0', [interaction.guild.id, code]);
        const coupon = couponResult.rows[0];

        if (!coupon) {
            return interaction.followUp({ content: '❌ Cupom inválido, expirado ou já utilizado.', ephemeral: true });
        }

        const cartResult = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id]);
        const cart = cartResult.rows[0];
        const productsInCart = cart.products_json || [];

        if (cart.coupon_id) {
            return interaction.followUp({ content: '❌ Já existe um cupom aplicado a este carrinho.', ephemeral: true });
        }

        let originalPrice = productsInCart.reduce((sum, p) => sum + parseFloat(p.price), 0);
        const discountAmount = originalPrice * (coupon.discount_percent / 100);
        const finalPrice = originalPrice - discountAmount;

        await db.query(
            'UPDATE store_carts SET coupon_id = $1, total_price = $2 WHERE channel_id = $3',
            [coupon.id, finalPrice.toFixed(2), interaction.channel.id]
        );
        
        await db.query('UPDATE store_coupons SET uses_left = uses_left - 1 WHERE id = $1', [coupon.id]);

        const updatedCart = { ...cart, coupon_id: coupon.id, total_price: finalPrice };
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        const cartPanelPayload = generateCartPanel(updatedCart, productsInCart, settings, coupon);

        await interaction.editReply(cartPanelPayload);
        await interaction.followUp({ content: `✅ Cupom \`${code}\` aplicado com sucesso!`, ephemeral: true });
    }
};