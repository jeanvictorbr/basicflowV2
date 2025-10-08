// handlers/buttons/mod_dossie_reset_history.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'mod_dossie_reset_history_',
    async execute(interaction) {
        const targetId = interaction.customId.split('_')[4];

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mod_dossie_reset_confirm_${targetId}`).setLabel('Sim, Resetar Histórico').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`mod_dossie_manage_back_${targetId}`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: `⚠️ **Atenção!** Você tem certeza que deseja apagar **TODO** o histórico de moderação para o usuário <@${targetId}>? Esta ação é irreversível.`,
            components: [confirmationButtons],
            ephemeral: true
        });
    }
};