// Crie em: handlers/buttons/tickets_set_thumbnail.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'tickets_set_thumbnail',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_tickets_thumbnail').setTitle('Definir Thumbnail do Ticket');
        const thumbnailInput = new TextInputBuilder().setCustomId('input_thumbnail').setLabel("URL da imagem (thumbnail)").setStyle(TextInputStyle.Short).setPlaceholder("https://i.imgur.com/imagem.png").setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(thumbnailInput));
        await interaction.showModal(modal);
    }
};