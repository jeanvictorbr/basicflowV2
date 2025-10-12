// Crie em: handlers/buttons/dev_guilds_send_dm_all.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_guilds_send_dm_all',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_dev_guilds_send_dm_all')
            .setTitle('Enviar Mensagem em Massa');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message_all')
            .setLabel("Mensagem a ser enviada para TODOS os donos")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Digite seu anúncio ou comunicado aqui...')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};