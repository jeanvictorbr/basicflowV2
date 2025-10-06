// handlers/buttons/ausencia_request_start.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'ausencia_request_start',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_ausencia_submit')
            .setTitle('Solicitação de Ausência');

        const startDateInput = new TextInputBuilder()
            .setCustomId('input_start_date')
            .setLabel("Data de Início")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 20/10/2025')
            .setRequired(true);

        const endDateInput = new TextInputBuilder()
            .setCustomId('input_end_date')
            .setLabel("Data de Término")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 25/10/2025')
            .setRequired(true);

        const reasonInput = new TextInputBuilder()
            .setCustomId('input_reason')
            .setLabel("Motivo da Ausência")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Ex: Viagem em família, problemas pessoais, etc.')
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(startDateInput),
            new ActionRowBuilder().addComponents(endDateInput),
            new ActionRowBuilder().addComponents(reasonInput)
        );

        await interaction.showModal(modal);
    }
};