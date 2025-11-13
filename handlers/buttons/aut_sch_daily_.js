// Substitua o conteúdo em: handlers/buttons/aut_sch_daily_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_sch_daily_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        const modal = new ModalBuilder()
            .setCustomId(`aut_sch_daily_modal_${annId}`)
            .setTitle('Diário: Some 3 Horas!'); // Título educativo

        const timeInput = new TextInputBuilder()
            .setCustomId('aut_sch_time')
            .setLabel('Horário UTC (Hora Brasil + 3)')
            .setPlaceholder('Ex: Para 14:00 Brasil, digite 17:00')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(5);

        const row = new ActionRowBuilder().addComponents(timeInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};