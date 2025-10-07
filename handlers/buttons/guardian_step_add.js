// Crie em: handlers/buttons/guardian_step_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'guardian_step_add_', // Handler dinâmico
    async execute(interaction) {
        const policyId = interaction.customId.split('_')[3];
        
        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_step_create_${policyId}`)
            .setTitle('Adicionar Novo Passo de Ação');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_threshold')
                    .setLabel("Limiar do Gatilho (Nº de msgs, %, etc)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 3 (para 3 mensagens de spam)')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_actions')
                    .setLabel("Ações (separadas por vírgula)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('AVISAR_CHAT, DELETAR, TIMEOUT, KICK, BAN')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_timeout')
                    .setLabel("Duração do Timeout em Minutos (se usar)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 5')
                    .setRequired(false)
            )
        );
        
        await interaction.showModal(modal);
    }
};