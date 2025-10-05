// Crie em: handlers/buttons/uniformes_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
module.exports = {
    customId: 'uniformes_add',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_uniformes_add').setTitle('Adicionar Novo Uniforme');
        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Uniforme").setStyle(TextInputStyle.Short).setRequired(true);
        const descInput = new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição").setStyle(TextInputStyle.Paragraph).setRequired(false);
        const imageInput = new TextInputBuilder().setCustomId('input_image').setLabel("URL da Imagem").setStyle(TextInputStyle.Short).setRequired(false);
        const roleInput = new TextInputBuilder().setCustomId('input_role').setLabel("ID do Cargo associado").setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(roleInput)
        );
        await interaction.showModal(modal);
    }
};