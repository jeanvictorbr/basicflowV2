// Crie o novo arquivo em: handlers/buttons/aut_sch_interval_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_sch_interval_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        const modal = new ModalBuilder()
            .setCustomId(`aut_sch_interval_modal_${annId}`)
            .setTitle('Configurar Loop / Intervalo');

        const minutesInput = new TextInputBuilder()
            .setCustomId('aut_sch_minutes')
            .setLabel('Intervalo em MINUTOS')
            .setPlaceholder('Ex: 30 (para enviar de 30 em 30 min)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(3); // Máximo 999 minutos

        modal.addComponents(new ActionRowBuilder().addComponents(minutesInput));
        await interaction.showModal(modal);
    }
};