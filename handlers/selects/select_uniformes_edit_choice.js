// handlers/selects/select_uniformes_edit_choice.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');
module.exports = {
    customId: 'select_uniformes_edit_choice',
    async execute(interaction) {
        const uniformId = interaction.values[0];
        const uniform = (await db.query('SELECT * FROM uniforms WHERE id = $1', [uniformId])).rows[0];
        
        const modal = new ModalBuilder().setCustomId(`modal_uniformes_edit_${uniformId}`).setTitle('Editando Uniforme');
        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Uniforme").setStyle(TextInputStyle.Short).setValue(uniform.name).setRequired(true);
        const descInput = new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição").setStyle(TextInputStyle.Paragraph).setValue(uniform.description || '').setRequired(false);
        const imageInput = new TextInputBuilder().setCustomId('input_image').setLabel("URL da Imagem").setStyle(TextInputStyle.Short).setValue(uniform.image_url || '').setRequired(false);
        const presetInput = new TextInputBuilder().setCustomId('input_preset').setLabel("Código do Preset").setStyle(TextInputStyle.Paragraph).setValue(uniform.preset_code).setRequired(true); // MUDANÇA
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(imageInput),
            new ActionRowBuilder().addComponents(presetInput) // MUDANÇA
        );
        await interaction.showModal(modal);
    }
};