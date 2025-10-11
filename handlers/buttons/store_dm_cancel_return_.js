// handlers/buttons/store_dm_cancel_return_.js
const db = require('../../database.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');

module.exports = {
    customId: 'store_dm_cancel_return_',
    async execute(interaction) {
        await interaction.deferUpdate();
        // CORREÇÃO: Extrai guildId e cartId do customId
        const [, , , , guildId, cartId] = interaction.customId.split('_');
        
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        const productsInCart = cart.products_json || [];
        const coupon = cart.coupon_id ? (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0] : null;

        const originalPanel = generateCartPanel(cart, productsInCart, settings, coupon);

        await interaction.editReply(originalPanel);
    }
};