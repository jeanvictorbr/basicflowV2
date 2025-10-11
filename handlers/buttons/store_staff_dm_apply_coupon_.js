// Crie em: handlers/buttons/store_staff_dm_apply_coupon_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_staff_dm_apply_coupon_',
    async execute(interaction) {
        const [, , , , guildId, cartId] = interaction.customId.split('_');

        const modal = new ModalBuilder()
            .setCustomId(`modal_staff_apply_coupon_${guildId}_${cartId}`)
            .setTitle('Aplicar Cupom para Cliente');

        const couponInput = new TextInputBuilder()
            .setCustomId('input_coupon_code')
            .setLabel("Código do Cupom")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: DESCONTO10')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(couponInput));
        await interaction.showModal(modal);
    }
};