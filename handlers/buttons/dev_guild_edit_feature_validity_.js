// Crie em: handlers/buttons/dev_guild_edit_feature_validity_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_guild_edit_feature_validity_',
    async execute(interaction) {
        const [, , , , , guildId, featureKey] = interaction.customId.split('_');

        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_guild_edit_feature_validity_${guildId}_${featureKey}`)
            .setTitle(`Editar Validade: ${featureKey}`);
        
        const daysInput = new TextInputBuilder()
            .setCustomId('input_days_validity')
            .setLabel("Adicionar ou Remover Dias")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 30 para adicionar, -7 para remover')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(daysInput));
        await interaction.showModal(modal);
    }
};