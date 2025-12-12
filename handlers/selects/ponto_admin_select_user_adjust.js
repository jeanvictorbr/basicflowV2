// handlers/selects/ponto_admin_select_user_adjust.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'ponto_admin_select_user_adjust',
    async execute(interaction) {
        const targetUserId = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_ponto_adjust_submit_${targetUserId}`)
            .setTitle('Ajustar Banco de Horas');

        const input = new TextInputBuilder()
            .setCustomId('input_adjustment')
            .setLabel('Operação (+Tempo, -Tempo ou RESET)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: +2, -3, +100 (minutos) ou RESET')
            .setRequired(true);

        const reason = new TextInputBuilder()
            .setCustomId('input_reason')
            .setLabel('Motivo do Ajuste')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Erro no sistema, Abono, etc.')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(input),
            new ActionRowBuilder().addComponents(reason)
        );

        await interaction.showModal(modal);
    }
};