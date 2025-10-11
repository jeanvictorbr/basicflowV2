// Crie em: handlers/buttons/store_add_stock.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'store_add_stock_', // Handler dinâmico
    async execute(interaction) {
        const productId = interaction.customId.split('_')[3];

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_add_stock_${productId}`)
            .setTitle('Adicionar Itens ao Estoque Real');

        const stockInput = new TextInputBuilder()
            .setCustomId('input_stock_content')
            .setLabel("Conteúdo do Estoque (um item por linha)")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('COLA-SUA-CHAVE-AQUI-1\nCOLA-SUA-CHAVE-AQUI-2\nhttp://link-para-download.com/item3')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(stockInput));
        await interaction.showModal(modal);
    }
};