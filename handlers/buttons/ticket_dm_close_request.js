// Crie este arquivo
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ticket_dm_close_request_',
    async execute(interaction) {
        const ticketId = interaction.customId.split('_')[4];
        await interaction.reply({
            content: 'Você tem certeza que deseja finalizar este atendimento?',
            ephemeral: true,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`ticket_dm_close_confirm_${ticketId}`).setLabel('Sim, finalizar').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('delete_ephemeral_reply').setLabel('Não').setStyle(ButtonStyle.Secondary)
                )
            ]
        });
    }
};