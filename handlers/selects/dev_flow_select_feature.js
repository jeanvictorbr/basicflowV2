const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_flow_select_feature',
    async execute(interaction) {
        const featureKey = interaction.values[0];

        // Passamos a featureKey no ID do modal para recuperar depois
        const modal = new ModalBuilder()
            .setCustomId(`dev_flow_add_sub_${featureKey}`) 
            .setTitle('Detalhes do Produto');

        const name = new TextInputBuilder().setCustomId('name').setLabel("Nome na Loja (ex: Automações 30d)").setStyle(TextInputStyle.Short).setRequired(true);
        const price = new TextInputBuilder().setCustomId('price').setLabel("Preço (FC)").setStyle(TextInputStyle.Short).setRequired(true);
        const days = new TextInputBuilder().setCustomId('days').setLabel("Duração (Dias)").setStyle(TextInputStyle.Short).setRequired(true);
        const emoji = new TextInputBuilder().setCustomId('emoji').setLabel("Emoji").setStyle(TextInputStyle.Short).setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(name),
            new ActionRowBuilder().addComponents(price),
            new ActionRowBuilder().addComponents(days),
            new ActionRowBuilder().addComponents(emoji)
        );

        await interaction.showModal(modal);
    }
};