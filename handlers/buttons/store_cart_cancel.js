// Crie em: handlers/buttons/store_cart_cancel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'store_cart_cancel',
    async execute(interaction) {
        await interaction.deferUpdate();

        const confirmationEmbed = new EmbedBuilder()
            .setColor('#E74C3C') // Vermelho
            .setTitle('⚠️ Confirmação de Cancelamento')
            .setDescription('Você tem certeza que deseja cancelar esta compra e esvaziar seu carrinho? Esta ação não pode ser desfeita.');

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('store_cart_cancel_confirm')
                .setLabel('Sim, Cancelar a Compra')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️'),
            new ButtonBuilder()
                .setCustomId('store_cart_cancel_return')
                .setLabel('Não, Voltar ao Carrinho')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('↩️')
        );

        await interaction.editReply({ embeds: [confirmationEmbed], components: [confirmationButtons] });
    }
};