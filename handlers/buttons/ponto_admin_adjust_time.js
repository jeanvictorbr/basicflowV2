// handlers/buttons/ponto_admin_adjust_time.js
const { UserSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'ponto_admin_adjust_time',
    async execute(interaction) {
        const userSelect = new UserSelectMenuBuilder()
            .setCustomId('ponto_admin_select_user_adjust')
            .setPlaceholder('Selecione o usuário para ajustar o tempo')
            .setMaxValues(1);

        const row = new ActionRowBuilder().addComponents(userSelect);

        await interaction.reply({
            content: '👤 Selecione o usuário cujo banco de horas você deseja modificar:',
            components: [row],
            ephemeral: true
        });
    }
};