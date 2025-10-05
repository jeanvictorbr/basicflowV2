// handlers/buttons/uniformes_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
module.exports = {
    customId: 'uniformes_add',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_uniformes_add').setTitle('Adicionar Novo Uniforme');
        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Uniforme").setStyle(TextInputStyle.Short).setRequired(true);
        const descInput = new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição (opcional)").setStyle(TextInputStyle.Paragraph).setRequired(false);
        const imageInput = new TextInputBuilder().setCustomId('input_image').setLabel("URL da Imagem (opcional)").setStyle(TextInputStyle.Short).setRequired(false);
        const presetInput = new TextInputBuilder().setCustomId('input_preset').setLabel("Código do Preset (para copiar)").setStyle(TextInputStyle.Paragraph).setRequired(true); // MUDANÇA
        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(presetInput) // MUDANÇA
        );
        await interaction.showModal(modal);
    }
};