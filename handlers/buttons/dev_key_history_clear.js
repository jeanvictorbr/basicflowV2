// Crie em: handlers/buttons/dev_key_history_clear.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_key_history_clear',
    async execute(interaction) {
        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('dev_key_history_clear_all_confirm').setLabel('Apagar TUDO').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('dev_key_history_clear_specific').setLabel('Apagar Específico').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('dev_open_key_history').setLabel('Cancelar').setStyle(ButtonStyle.Primary)
        );

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: "## ⚠️ Confirmação de Exclusão" },
                    { type: 10, content: "> Você tem certeza que deseja apagar os registros do histórico? Esta ação é irreversível." }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};