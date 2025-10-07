// handlers/selects/select_guardian_rule_trigger.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_guardian_rule_trigger',
    async execute(interaction) {
        const triggerType = interaction.values[0];

        // --- CORREÇÃO APLICADA AQUI ---
        // Mapeia o tipo de gatilho para um título claro e um rótulo de campo
        const config = {
            'TOXICITY': {
                title: 'Nova Regra: Nível de Toxicidade',
                thresholdLabel: 'Nível de Toxicidade (Ex: 80)',
            },
            'SPAM_TEXT': {
                title: 'Nova Regra: Repetição de Texto',
                thresholdLabel: 'Nº de Mensagens Repetidas (Ex: 3)',
            },
            'MENTION_SPAM': {
                title: 'Nova Regra: Spam de Menções',
                thresholdLabel: 'Nº Mínimo de Menções (Ex: 5)',
            }
        };

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_rule_create_${triggerType}`)
            .setTitle(config[triggerType].title); // <-- Título dinâmico

        const nameInput = new TextInputBuilder().setCustomId('input_name').setLabel("Dê um nome para a regra").setStyle(TextInputStyle.Short).setPlaceholder('Ex: Anti-Spam Leve').setRequired(true);
        
        const thresholdInput = new TextInputBuilder().setCustomId('input_threshold').setLabel(config[triggerType].thresholdLabel).setStyle(TextInputStyle.Short).setRequired(true); // <-- Rótulo dinâmico
        
        const actionsInput = new TextInputBuilder().setCustomId('input_actions')
            .setLabel("Ações (separadas por vírgula)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('DELETAR, AVISAR_CHAT, AVISAR_DM, TIMEOUT, KICK, BAN')
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