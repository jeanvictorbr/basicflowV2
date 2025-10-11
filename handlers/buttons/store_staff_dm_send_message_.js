// Crie em: handlers/buttons/store_staff_dm_send_message_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_staff_dm_send_message_',
    async execute(interaction) {
        const [, , , , guildId, cartId] = interaction.customId.split('_');

        const modal = new ModalBuilder()
            .setCustomId(`modal_staff_send_message_${guildId}_${cartId}`)
            .setTitle('Enviar Mensagem ao Cliente');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message_to_customer')
            .setLabel("Sua mensagem para o cliente")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Digite sua resposta ou instrução aqui...')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};