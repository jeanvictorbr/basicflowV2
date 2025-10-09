// Crie este arquivo em: handlers/buttons/stop_category_press.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'stop_category_',
    async execute(interaction) {
        const category = interaction.customId.split('_')[2];

        const modal = new ModalBuilder()
            .setCustomId(`modal_stop_submit_${category}`)
            .setTitle(`Categoria: ${category}`);

        const wordInput = new TextInputBuilder()
            .setCustomId('input_word')
            .setLabel("Sua palavra para esta categoria")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(wordInput));
        await interaction.showModal(modal);
    }
};