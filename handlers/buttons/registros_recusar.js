// handlers/buttons/registros_recusar.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'registros_recusar',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_registro_recusar_motivo')
            .setTitle('Recusar Ficha de Registro');

        const motivoInput = new TextInputBuilder()
            .setCustomId('input_motivo_recusa')
            .setLabel("Motivo da recusa")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Nome RP fora do padrão, ID inválido, etc.')
            .setRequired(true);
            
        modal.addComponents(new ActionRowBuilder().addComponents(motivoInput));
        await interaction.showModal(modal);
    }
};