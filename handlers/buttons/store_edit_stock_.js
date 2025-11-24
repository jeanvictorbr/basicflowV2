// Crie em: handlers/buttons/store_edit_stock_.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_stock_', // Handler dinâmico
    async execute(interaction) {
        const productId = interaction.customId.split('_')[3];

        const stockResult = await db.query('SELECT content FROM store_stock WHERE product_id = $1 AND is_claimed = false ORDER BY id ASC', [productId]);
        
        const stockContent = stockResult.rows.map(item => item.content).join('\n');

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_edit_stock_${productId}`)
            .setTitle('Editar Estoque Real do Produto');

        const stockInput = new TextInputBuilder()
            .setCustomId('input_stock_content')
            .setLabel("Conteúdo do Estoque (um item por linha)")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('COLA-SUA-CHAVE-AQUI-1\nCOLA-SUA-CHAVE-AQUI-2\nhttp://link-para-download.com/item3')
            .setValue(stockContent || '') // Preenche com o estoque atual
            .setRequired(false); // Permite esvaziar o estoque

        modal.addComponents(new ActionRowBuilder().addComponents(stockInput));
        await interaction.showModal(modal);
    }
};