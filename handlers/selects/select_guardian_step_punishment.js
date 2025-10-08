// Crie em: handlers/selects/select_guardian_step_punishment.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_guardian_step_punishment_',
    async execute(interaction) {
        const policyId = interaction.customId.split('_')[4];
        const punishmentId = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_step_from_punishment_${policyId}_${punishmentId}`)
            .setTitle('Adicionar Passo (2/2)');
        
        const thresholdInput = new TextInputBuilder()
            .setCustomId('input_threshold')
            .setLabel("Limiar do Gatilho (Nº, %, etc)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 3 (para 3 mensagens de spam)')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(thresholdInput));
        await interaction.showModal(modal);
    }
};