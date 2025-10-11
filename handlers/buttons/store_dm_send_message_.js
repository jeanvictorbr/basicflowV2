// Crie em: handlers/buttons/store_dm_send_message_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_dm_send_message_',
    async execute(interaction) {
        const [, , , guildId, cartId] = interaction.customId.split('_');

        const modal = new ModalBuilder()
            .setCustomId(`modal_dm_send_message_${guildId}_${cartId}`)
            .setTitle('Enviar Mensagem ao Atendente');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message_to_staff')
            .setLabel("Sua mensagem")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Digite sua dúvida ou mensagem aqui...')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};