const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
    customId: 'store_remove_search',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_store_remove_search').setTitle('Pesquisar para Remover');
        const input = new TextInputBuilder().setCustomId('q').setLabel('Nome do Produto').setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};