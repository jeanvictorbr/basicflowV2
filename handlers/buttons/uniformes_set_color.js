// Crie em: handlers/buttons/uniformes_set_color.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
module.exports = {
    customId: 'uniformes_set_color',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_uniformes_color').setTitle('Definir Cor da Vitrine');
        const input = new TextInputBuilder().setCustomId('input_color').setLabel("Código Hex da cor").setStyle(TextInputStyle.Short).setPlaceholder("#FFFFFF").setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};