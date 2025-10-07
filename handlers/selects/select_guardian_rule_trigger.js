// handlers/selects/select_guardian_rule_trigger.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_guardian_rule_trigger',
    async execute(interaction) {
        const triggerType = interaction.values[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_rule_create_${triggerType}`)
            .setTitle('Nova Regra: Detalhes e Ações');

        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Dê um nome para a regra").setStyle(TextInputStyle.Short).setPlaceholder('Ex: Anti-Spam Leve').setRequired(true);
        
        let thresholdLabel = "Limiar (Valor)";
        if (triggerType === 'TOXICITY') thresholdLabel = "Nível de Toxicidade (Ex: 80)";
        if (triggerType === 'SPAM_TEXT') thresholdLabel = "Nº de Mensagens Repetidas (Ex: 3)";
        if (triggerType === 'MENTION_SPAM') thresholdLabel = "Nº Mínimo de Menções (Ex: 5)";
        
        const thresholdInput = new TextInputBuilder().setCustomId('input_threshold').setLabel(thresholdLabel).setStyle(TextInputStyle.Short).setRequired(true);
        
        const actionsInput = new TextInputBuilder().setCustomId('input_actions')
            .setLabel("Escolha as Ações (separadas por vírgula)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('DELETAR, AVISAR, TIMEOUT, KICK, BAN')
            .setRequired(true);
            
        const timeoutInput = new TextInputBuilder().setCustomId('input_timeout_duration')
            .setLabel("Duração do Timeout (em minutos)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 5 (só preencha se usar a ação TIMEOUT)')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(thresholdInput),
            new ActionRowBuilder().addComponents(actionsInput),
            new ActionRowBuilder().addComponents(timeoutInput)
        );

        await interaction.showModal(modal);
    }
};