// Crie em: handlers/selects/select_ticket_greeting_edit.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_greeting_edit',
    async execute(interaction) {
        const messageId = interaction.values[0];
        const message = (await db.query('SELECT message FROM ticket_greeting_messages WHERE id = $1', [messageId])).rows[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_ticket_greeting_edit_${messageId}`)
            .setTitle(`Editando Mensagem ID: ${messageId}`);

        const messageInput = new TextInputBuilder()
            .setCustomId('input_greeting_message')
            .setLabel("Novo texto da mensagem")
            .setStyle(TextInputStyle.Paragraph)
            .setValue(message.message)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};