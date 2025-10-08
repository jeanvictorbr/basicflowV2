// Crie em: handlers/buttons/guardian_step_add_simple.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'guardian_step_add_simple_',
    async execute(interaction) {
        const policyId = interaction.customId.split('_')[4];

        const modal = new ModalBuilder()
            .setCustomId(`modal_guardian_step_create_${policyId}`)
            .setTitle('Adicionar Novo Passo (Ação Simples)');
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_threshold').setLabel("Limiar do Gatilho (Nº, %, etc)").setStyle(TextInputStyle.Short).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_actions').setLabel("Ações (DELETAR, AVISAR_CHAT, etc)").setStyle(TextInputStyle.Short).setPlaceholder('TIMEOUT, KICK, BAN...').setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_timeout').setLabel("Duração do Timeout (se aplicável)").setStyle(TextInputStyle.Short).setPlaceholder('Ex: 10 (em minutos)').setRequired(false)
            )
        );
        
        await interaction.showModal(modal);
    }
};