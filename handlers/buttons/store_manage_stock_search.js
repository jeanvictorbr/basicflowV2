// Crie em: handlers/buttons/store_manage_stock_search.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'store_manage_stock_search',
    async execute(interaction) {
        // Modais precisam ser exibidos com showModal, não deferUpdate
        
        const modal = new ModalBuilder()
            .setCustomId('modal_store_stock_search')
            .setTitle('Pesquisar Produto no Estoque');

        const input = new TextInputBuilder()
            .setCustomId('search_query')
            .setLabel('Nome do Produto (ou parte dele)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Vip Ouro')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};