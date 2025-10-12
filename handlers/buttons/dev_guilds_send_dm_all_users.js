// Crie em: handlers/buttons/dev_guilds_send_dm_all_users.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_guilds_send_dm_all_users',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_dev_guilds_send_dm_all_users')
            .setTitle('Enviar DM Global para Membros');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message_all_users')
            .setLabel("Mensagem para TODOS os membros")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Digite seu comunicado. USE COM EXTREMA CAUTELA.')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};