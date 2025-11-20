// File: handlers/buttons/aut_oauth_mass_transfer_start.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_oauth_mass_transfer_start',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_oauth_mass_transfer')
            .setTitle('📦 Transferência em Massa');

        const inputId = new TextInputBuilder()
            .setCustomId('target_guild_id')
            .setLabel("ID do Servidor de Destino")
            .setPlaceholder("Cole o ID do servidor (O bot deve estar lá!)")
            .setValue(interaction.guild.id) // Padrão: Servidor atual
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const inputQtd = new TextInputBuilder()
            .setCustomId('transfer_amount')
            .setLabel("Quantidade de Membros")
            .setPlaceholder("Ex: 10, 50, 100")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputId),
            new ActionRowBuilder().addComponents(inputQtd)
        );

        await interaction.showModal(modal);
    }
};