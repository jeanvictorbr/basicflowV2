// File: handlers/buttons/aut_oauth_mass_transfer_global_start.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_oauth_mass_transfer_global_start',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mass_transfer_global')
            .setTitle('🌍 Transferência Global');

        const inputId = new TextInputBuilder()
            .setCustomId('target_guild_id')
            .setLabel("ID do Servidor de Destino")
            .setPlaceholder("Cole o ID do servidor aqui")
            .setValue(interaction.guild.id)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const inputQtd = new TextInputBuilder()
            .setCustomId('transfer_amount')
            .setLabel("Quantidade (Do mais recente)")
            .setPlaceholder("Ex: 100")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inputId),
            new ActionRowBuilder().addComponents(inputQtd)
        );

        await interaction.showModal(modal);
    }
};