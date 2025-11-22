// File: handlers/buttons/store_cart_cancel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'store_cart_cancel',
    async execute(interaction) {
        // Nova mensagem efêmera para confirmação
        await interaction.deferReply({ ephemeral: true });

        const confirmationEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('⚠️ Confirmação de Cancelamento')
            .setDescription('Você tem certeza que deseja cancelar esta compra e esvaziar seu carrinho? Esta ação não pode ser desfeita.');

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('store_cart_cancel_confirm')
                .setLabel('Sim, Cancelar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
                // Não precisamos de botão "Não/Voltar" em mensagem efêmera, basta ignorar.
        );

        await interaction.editReply({ embeds: [confirmationEmbed], components: [confirmationButtons] });
    }
};