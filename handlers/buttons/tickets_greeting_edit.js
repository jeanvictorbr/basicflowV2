// Crie em: handlers/buttons/tickets_greeting_edit.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'tickets_greeting_edit',
    async execute(interaction) {
        const settings = (await db.query('SELECT tickets_greeting_message FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];

        const modal = new ModalBuilder()
            .setCustomId('modal_ticket_greeting_edit')
            .setTitle('Editar Mensagem de Saudação');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_greeting_message')
            .setLabel("Mensagem de boas-vindas")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Use {user} para mencionar o usuário e {server} para o nome do servidor.")
            .setValue(settings?.tickets_greeting_message || '')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));

        await interaction.showModal(modal);
    }
};