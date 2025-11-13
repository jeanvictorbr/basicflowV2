// handlers/buttons/dev_guild_manage_select.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'dev_guild_manage_select',
    async execute(interaction) {
        // Em vez de atualizar a mensagem direto, abrimos um Modal para pesquisa
        // Isso resolve o problema de listar apenas 20 de 90 servidores.
        
        const modal = new ModalBuilder()
            .setCustomId('modal_dev_search_guild')
            .setTitle('Gerenciar Guilda - Buscar');

        const searchInput = new TextInputBuilder()
            .setCustomId('search_query')
            .setLabel("Nome ou ID do Servidor")
            .setPlaceholder("Digite para filtrar (deixe vazio para listar)")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const firstActionRow = new ActionRowBuilder().addComponents(searchInput);
        modal.addComponents(firstActionRow);

        await interaction.showModal(modal);
    }
};