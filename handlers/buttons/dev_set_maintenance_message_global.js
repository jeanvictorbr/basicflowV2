// Crie em: handlers/buttons/dev_set_maintenance_message_global.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'dev_set_maintenance_message_global',
    async execute(interaction) {
        const botStatus = (await db.query("SELECT maintenance_message_global FROM bot_status WHERE status_key = 'main'")).rows[0];

        const modal = new ModalBuilder()
            .setCustomId('modal_dev_set_maintenance_message_global')
            .setTitle('Mensagem de Manutenção Global');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message_global')
            .setLabel("Mensagem exibida quando o BOT estiver offline")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: O bot está passando por uma manutenção programada e retornará em breve.')
            .setValue(botStatus?.maintenance_message_global || '')
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};