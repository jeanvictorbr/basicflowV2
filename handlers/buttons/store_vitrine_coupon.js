// Substitua o conteúdo em: handlers/buttons/store_vitrine_coupon.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_vitrine_coupon_',
    async execute(interaction) {
        // CORREÇÃO: Lógica de parsing de IDs robusta.
        const productIds = interaction.customId.replace('store_vitrine_coupon_', '');

        const modal = new ModalBuilder()
            .setCustomId(`modal_vitrine_apply_coupon_${productIds}`)
            .setTitle('Aplicar Cupom de Desconto');
            
        const couponInput = new TextInputBuilder()
            .setCustomId('input_coupon_code')
            .setLabel('Digite o código do seu cupom')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
            
        modal.addComponents(new ActionRowBuilder().addComponents(couponInput));
        await interaction.showModal(modal);
    }
};