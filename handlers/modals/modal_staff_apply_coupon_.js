// Crie em: handlers/modals/modal_staff_apply_coupon_.js
const db = require('../../database.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');
const generateStaffCartPanel = require('../../ui/store/staffCartPanel.js');

module.exports = {
    customId: 'modal_staff_apply_coupon_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const [, , , , guildId, cartId] = interaction.customId.split('_');
        const code = interaction.fields.getTextInputValue('input_coupon_code').toUpperCase();

        const couponResult = await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 AND code = $2 AND is_active = true AND uses_left > 0', [guildId, code]);
        const coupon = couponResult.rows[0];

        if (!coupon) {
            return interaction.editReply({ content: '❌ Cupom inválido, expirado ou já utilizado.' });
        }

        const cartResult = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId]);
        const cart = cartResult.rows[0];
        const productsInCart = cart.products_json || [];

        let originalPrice = productsInCart.reduce((sum, p) => sum + parseFloat(p.price), 0);
        const discountAmount = originalPrice * (coupon.discount_percent / 100);
        const finalPrice = originalPrice - discountAmount;

        await db.query('UPDATE store_carts SET coupon_id = $1, total_price = $2 WHERE channel_id = $3', [coupon.id, finalPrice, cartId]);
        await db.query('UPDATE store_coupons SET uses_left = uses_left - 1 WHERE id = $1', [coupon.id]);
        
        const updatedCart = { ...cart, coupon_id: coupon.id, total_price: finalPrice };
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const customer = await interaction.client.users.fetch(cart.user_id);

        // Atualiza o painel na DM do cliente
        try {
            const dmChannel = await customer.createDM();
            const messages = await dmChannel.messages.fetch({ limit: 50 });
            const cartMessage = messages.find(m => m.embeds[0]?.footer?.text.includes(cartId));
            if (cartMessage) {
                const customerPanel = generateCartPanel(updatedCart, productsInCart, settings, coupon);
                await cartMessage.edit(customerPanel);
            }
        } catch (e) { console.error("Falha ao atualizar painel do cliente.") }

        // Atualiza o painel na DM do staff
        const staffPanel = generateStaffCartPanel(updatedCart, productsInCart, customer);
        await interaction.message.edit(staffPanel);
        
        await interaction.editReply({ content: `✅ Cupom \`${code}\` aplicado com sucesso ao carrinho do cliente!` });
    }
};