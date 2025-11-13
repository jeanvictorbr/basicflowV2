// Substitua o conteúdo em: handlers/buttons/aut_sch_weekly_.js
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_sch_weekly_',
    async execute(interaction) {
        const annId = interaction.customId.split('_').pop();

        const modal = new ModalBuilder()
            .setCustomId(`aut_sch_weekly_modal_${annId}`)
            .setTitle('Agendamento Semanal (UTC)');

        // CORREÇÃO: Label e placeholder atualizados para (UTC)
        const dayInput = new TextInputBuilder()
            .setCustomId('aut_sch_day')
            .setLabel('Dia da Semana (0-7 em UTC)')
            .setPlaceholder('0 ou 7 = Domingo, 1 = Segunda, ...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMaxLength(1);

        const timeInput = new TextInputBuilder()
            .setCustomId('aut_sch_time')
            .setLabel('Horário (Formato HH:MM em UTC)')
            .setPlaceholder('Ex: 12:30 (Para 09:30 BRT)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true)
            .setMinLength(5)
            .setMaxLength(5);

        modal.addComponents(
            new ActionRowBuilder().addComponents(dayInput),
            new ActionRowBuilder().addComponents(timeInput)
        );

        await interaction.showModal(modal);
    }
};