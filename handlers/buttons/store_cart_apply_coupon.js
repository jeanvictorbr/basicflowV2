// Crie em: handlers/buttons/store_cart_apply_coupon.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_cart_apply_coupon',
    async execute(interaction) {
        // Verifica se já existe um cupom aplicado
        const cart = (await db.query('SELECT coupon_id FROM store_carts WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (cart && cart.coupon_id) {
            return interaction.reply({ content: '❌ Já existe um cupom de desconto aplicado a este carrinho.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_store_apply_coupon')
            .setTitle('Aplicar Cupom de Desconto');

        const couponInput = new TextInputBuilder()
            .setCustomId('input_coupon_code')
            .setLabel("Código do Cupom")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: NATAL25')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(couponInput));
        await interaction.showModal(modal);
    }
};