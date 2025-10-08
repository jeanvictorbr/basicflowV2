// handlers/selects/select_dev_key_history_clear.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_dev_key_history_clear',
    async execute(interaction) {
        const historyEntryId = interaction.values[0];

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_key_history_delete_confirm_${historyEntryId}`).setLabel('Sim, Apagar Este Registro').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('dev_open_key_history').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: "## ⚠️ Confirmação Final" },
                    { type: 10, content: `> Tem certeza que deseja apagar o registro de histórico com ID **${historyEntryId}**?` }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};