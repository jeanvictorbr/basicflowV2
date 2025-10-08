// handlers/buttons/mod_dossie_reset_history.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_dossie_reset_history_',
    async execute(interaction) {
        const targetId = interaction.customId.split('_')[4];

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mod_dossie_reset_confirm_${targetId}`).setLabel('Sim, Resetar Histórico').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`mod_dossie_manage_back_${targetId}`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        // ATUALIZA a mensagem do dossiê para mostrar a confirmação
        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: "## ⚠️ Confirmação de Reset" },
                    { type: 10, content: `> Você tem certeza que deseja apagar **TODO** o histórico de moderação para o usuário <@${targetId}>?\n> \n> **Esta ação é irreversível.**` }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};