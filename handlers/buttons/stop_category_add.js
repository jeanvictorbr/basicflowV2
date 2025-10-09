// Crie este arquivo em: handlers/buttons/stop_category_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'stop_category_add',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_stop_category_add')
            .setTitle('Adicionar Categoria ao Stop!');
        const nameInput = new TextInputBuilder()
            .setCustomId('input_category_name')
            .setLabel("Nome da nova categoria")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Animal, Famoso, Marca de Carro...')
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
        await interaction.showModal(modal);
    }
};