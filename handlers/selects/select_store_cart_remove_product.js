// Crie em: handlers/selects/select_store_cart_remove_product.js
const db = require('../../database.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');

module.exports = {
    customId: 'select_store_cart_remove_product',
    async execute(interaction) {
        await interaction.deferUpdate();

        const indexToRemove = parseInt(interaction.values[0], 10);

        const cartResult = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [interaction.channel.id]);
        const cart = cartResult.rows[0];
        let products = cart.products_json || [];

        // Remove o item do array pelo índice
        if (indexToRemove >= 0 && indexToRemove < products.length) {
            products.splice(indexToRemove, 1);
        }

        // Recalcula o preço se houver um cupom
        if (cart.coupon_id) {
            const coupon = (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0];
            let originalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
            const discountAmount = originalPrice * (coupon.discount_percent / 100);
            cart.total_price = originalPrice - discountAmount;
        } else {
            cart.total_price = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        }
        
        await db.query('UPDATE store_carts SET products_json = $1::jsonb, total_price = $2 WHERE channel_id = $3', [JSON.stringify(products), cart.total_price, interaction.channel.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        const coupon = cart.coupon_id ? (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0] : null;

        const updatedPanel = generateCartPanel(cart, products, settings, coupon, interaction);

        // Edita a mensagem principal do carrinho
        await interaction.channel.messages.cache.find(m => m.author.id === interaction.client.user.id && m.embeds.length > 0).edit(updatedPanel);
        
        // Confirma a ação na interação efêmera
        await interaction.editReply({ content: '✅ Item removido com sucesso!', components: [] });
    }
};