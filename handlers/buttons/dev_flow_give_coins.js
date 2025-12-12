const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'dev_flow_give_coins',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('dev_flow_give_coins_sub')
            .setTitle('Enviar FlowCoins');

        const userId = new TextInputBuilder().setCustomId('user_id').setLabel("ID do Usuário").setStyle(TextInputStyle.Short).setRequired(true);
        const amount = new TextInputBuilder().setCustomId('amount').setLabel("Quantidade").setStyle(TextInputStyle.Short).setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(userId),
            new ActionRowBuilder().addComponents(amount)
        );

        await interaction.showModal(modal);
    }
};