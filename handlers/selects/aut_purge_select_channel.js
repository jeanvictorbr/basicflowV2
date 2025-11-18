// Local: handlers/selects/aut_purge_select_channel.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'aut_purge_select_channel',
    async execute(interaction) {
        const channelId = interaction.values[0];

        // Cria o modal
        // Passamos o channelId no customId do modal para recuperar no próximo passo
        const modal = new ModalBuilder()
            .setCustomId(`modal_aut_purge_submit_${channelId}`)
            .setTitle('Configurar Tempo de Limpeza');

        const timeInput = new TextInputBuilder()
            .setCustomId('purge_time_input')
            .setLabel('Tempo de Retenção')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 30m (minutos), 12h (horas), 7d (dias)')
            .setRequired(true)
            .setMaxLength(10);

        const row = new ActionRowBuilder().addComponents(timeInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    },
};