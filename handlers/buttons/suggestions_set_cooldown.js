// Crie este arquivo em: handlers/buttons/suggestions_set_cooldown.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'suggestions_set_cooldown',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_suggestions_set_cooldown')
            .setTitle('Definir Cooldown de Sugestões');

        const cooldownInput = new TextInputBuilder()
            .setCustomId('input_cooldown_minutes')
            .setLabel("Cooldown em minutos (0 para desativar)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Padrão: 2')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(cooldownInput));
        await interaction.showModal(modal);
    }
};