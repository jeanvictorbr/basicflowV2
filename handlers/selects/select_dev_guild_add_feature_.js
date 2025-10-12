// Crie em: handlers/selects/select_dev_guild_add_feature_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'select_dev_guild_add_feature_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[5];
        const features = interaction.values.join(',');
        
        const encodedFeatures = Buffer.from(features).toString('base64');

        const modal = new ModalBuilder()
            .setCustomId(`modal_dev_guild_add_feature_${guildId}_${encodedFeatures}`)
            .setTitle('Definir Validade da(s) Feature(s)');

        const daysInput = new TextInputBuilder()
            .setCustomId('input_days')
            .setLabel("Duração em dias")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 30')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(daysInput));
        await interaction.showModal(modal);
    }
};