// Local: handlers/selects/membros_mass_transfer_DEV.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'membros_mass_transfer_DEV',
    async execute(interaction) {
        const targetGuildId = interaction.values[0];

        if (targetGuildId === 'null') {
            return interaction.reply({ content: '❌ Nenhuma guilda válida selecionada.', flags: EPHEMERAL_FLAG });
        }

        const modal = new ModalBuilder()
            .setCustomId(`modal_mass_transfer_global_${targetGuildId}`)
            .setTitle(`Puxar Membros para ${targetGuildId}`);

        // 1. Input de Quantidade
        const quantityInput = new TextInputBuilder()
            .setCustomId('quantity')
            .setLabel('Quantidade')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Digite um número (ex: 50) ou "ALL" para todos')
            .setRequired(true);

        // 2. Input de Confirmação
        const confirmInput = new TextInputBuilder()
            .setCustomId('confirmation')
            .setLabel('Confirmação')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Digite "CONFIRMAR" para iniciar')
            .setRequired(true);

        const row1 = new ActionRowBuilder().addComponents(quantityInput);
        const row2 = new ActionRowBuilder().addComponents(confirmInput);
        
        modal.addComponents(row1, row2);

        await interaction.showModal(modal);
    },
};