// Crie em: handlers/selects/select_guardian_rule_trigger.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_guardian_rule_trigger',
    async execute(interaction) {
        const triggerType = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_rule_create_${triggerType}`)
            .setTitle('Passo 2: Detalhes da Regra');

        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Nome da Regra").setStyle(TextInputStyle.Short).setPlaceholder('Ex: Anti-Spam Básico').setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(nameInput));

        let thresholdLabel = "Limiar (Valor)";
        if (triggerType === 'TOXICITY') thresholdLabel = "Nível de Toxicidade (1-100)";
        if (triggerType === 'SPAM_TEXT') thresholdLabel = "Nº de Mensagens Repetidas";
        if (triggerType === 'MENTION_SPAM') thresholdLabel = "Nº Mínimo de Menções";
        
        const thresholdInput = new TextInputBuilder().setCustomId('input_threshold').setLabel(thresholdLabel).setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(thresholdInput));

        const actionsInput = new TextInputBuilder().setCustomId('input_actions').setLabel("Ações (separadas por vírgula)").setStyle(TextInputStyle.Short).setPlaceholder('Ex: DELETAR, AVISAR, TIMEOUT_5').setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(actionsInput));

        await interaction.showModal(modal);
    }
};