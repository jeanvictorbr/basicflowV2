// Crie em: handlers/buttons/store_add_coupon.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_add_coupon',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_store_add_coupon')
            .setTitle('Criar Novo Cupom de Desconto');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_code')
                    .setLabel("Código do Cupom (Ex: NATAL25)")
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_discount')
                    .setLabel("Porcentagem de Desconto (apenas números)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 25')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_uses')
                    .setLabel("Quantidade de Usos")
                    .setStyle(TextInputStyle.Short)
                    .setValue('1')
                    .setRequired(true)
            )
        );
        
        await interaction.showModal(modal);
    }
};