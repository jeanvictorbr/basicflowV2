// Crie/Substitua em: handlers/buttons/tickets_greeting_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'tickets_greeting_add',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_ticket_greeting_add')
            .setTitle('Adicionar Nova Mensagem de Saudação');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_greeting_message')
            .setLabel("Mensagem de boas-vindas")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Use {user} para mencionar o usuário e {server} para o nome do servidor.")
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};