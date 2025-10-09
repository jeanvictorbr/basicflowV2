// Garanta que o conteúdo em handlers/buttons/guardian_step_add_simple_action.js é este:
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'guardian_step_add_simple_action_',
    async execute(interaction) {
        // O ID da política é o 6º elemento (índice 5) do custom_id
        const policyId = interaction.customId.split('_')[5];

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_step_create_${policyId}`)
            .setTitle('Adicionar Passo (Ação Simples)');
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_threshold').setLabel("Limiar do Gatilho (Nº, %, etc)").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 3').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_actions').setLabel("Ações (separadas por vírgula)").setStyle(TextInputStyle.Short).setPlaceholder('DELETAR, AVISAR_CHAT, TIMEOUT...').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_timeout').setLabel("Duração do Timeout (se usar TIMEOUT)").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 10 (em minutos)').setRequired(false)
            )
        );
        
        await interaction.showModal(modal);
    }
};