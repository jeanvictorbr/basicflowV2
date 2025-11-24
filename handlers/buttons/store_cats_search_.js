// Crie em: handlers/buttons/store_cats_search_.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    // Captura 'store_cats_search_edit' e 'store_cats_search_remove'
    customId: 'store_cats_search_', 
    async execute(interaction) {
        // Pega o modo (edit ou remove) do ID do botão
        const mode = interaction.customId.replace('store_cats_search_', '');

        // Cria o Modal
        // Passamos o modo no ID do modal para saber o que fazer depois
        const modal = new ModalBuilder()
            .setCustomId(`modal_store_cats_search_${mode}`)
            .setTitle('Pesquisar Categoria');

        const input = new TextInputBuilder()
            .setCustomId('query')
            .setLabel('Nome da Categoria')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: Vips, Ouros...')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};