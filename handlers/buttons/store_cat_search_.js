// Crie em: handlers/buttons/store_cat_search_.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    // Captura IDs como: store_cat_search_add_5, store_cat_search_remove_5, store_cat_search_edit_5
    customId: 'store_cat_search_', 
    async execute(interaction) {
        // Extrair dados do ID: store_cat_search_MODE_CATID
        const parts = interaction.customId.replace('store_cat_search_', '').split('_');
        const mode = parts[0]; // 'add', 'remove' ou 'edit'
        const categoryId = parts[1];

        // Criar Modal
        // Passamos o modo e a categoria no ID do modal para saber como filtrar depois
        const modal = new ModalBuilder()
            .setCustomId(`modal_store_cat_search_${mode}_${categoryId}`)
            .setTitle('Pesquisar Produto na Categoria');

        const input = new TextInputBuilder()
            .setCustomId('query')
            .setLabel('Nome do Produto')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Vip Ouro')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};