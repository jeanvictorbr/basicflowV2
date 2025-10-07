// handlers/buttons/guardian_policy_add.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'guardian_policy_add',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_guardian_policy_create')
            .setTitle('Criar Nova Política de Moderação');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_name')
                    .setLabel("Nome da Política")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: Anti-Spam, Anti-Toxicidade')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_trigger')
                    .setLabel("Tipo de Gatilho")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('SPAM_TEXT, MENTION_SPAM, ou TOXICITY')
                    .setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('input_reset_hours')
                    .setLabel("Resetar infrações após (horas)")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Padrão: 24')
                    .setRequired(false)
            )
        );
        
        await interaction.showModal(modal);
    }
};