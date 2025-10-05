// handlers/buttons/registros_set_tag_aprovado.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'registros_set_tag_aprovado',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_registros_tag_aprovado').setTitle('Definir Tag de Aprovado');
        const tagInput = new TextInputBuilder().setCustomId('input_tag').setLabel("Tag para adicionar ao nickname").setStyle(TextInputStyle.Short).setPlaceholder("[Aprovado]").setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(tagInput));
        await interaction.showModal(modal);
    }
};