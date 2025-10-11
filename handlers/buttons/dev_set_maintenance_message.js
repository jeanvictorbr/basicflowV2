// Crie em: handlers/buttons/dev_set_maintenance_message.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'dev_set_maintenance_message',
    async execute(interaction) {
        const botStatus = (await db.query("SELECT maintenance_message FROM bot_status WHERE status_key = 'main'")).rows[0];

        const modal = new ModalBuilder()
            .setCustomId('modal_dev_set_maintenance_message')
            .setTitle('Definir Mensagem de Manutenção');

        const messageInput = new TextInputBuilder()
            .setCustomId('input_message')
            .setLabel("Mensagem exibida quando a IA estiver offline")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: A IA está passando por uma atualização rápida. Estará de volta em breve!')
            .setValue(botStatus?.maintenance_message || '')
            .setRequired(false);

        modal.addComponents(new ActionRowBuilder().addComponents(messageInput));
        await interaction.showModal(modal);
    }
};