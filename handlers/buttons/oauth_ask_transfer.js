// File: handlers/buttons/oauth_ask_transfer.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    // Captura qualquer botão que comece com 'oauth_ask_'
    customId: 'oauth_ask_', 
    
    async execute(interaction) {
        const targetUserId = interaction.customId.split('_')[2]; // oauth_ask_USERID

        const modal = new ModalBuilder()
            .setCustomId(`modal_oauth_single_${targetUserId}`) // Passa o ID do user no ID do modal
            .setTitle('🚀 Puxar Membro (Force Join)');

        const inputGuild = new TextInputBuilder()
            .setCustomId('target_guild_id')
            .setLabel("ID do Servidor de Destino")
            .setPlaceholder("Cole o ID do servidor aqui")
            .setValue(interaction.guild.id) // Já vem preenchido com o atual para facilitar
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(inputGuild));

        await interaction.showModal(modal);
    }
};