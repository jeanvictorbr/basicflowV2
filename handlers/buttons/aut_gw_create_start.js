const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_gw_create_start',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('aut_gw_create_submit')
            .setTitle('Criar Sorteio 🎉');

        const prizeInput = new TextInputBuilder()
            .setCustomId('gw_prize')
            .setLabel('Qual é o prêmio?')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('gw_duration')
            .setLabel('Duração (ex: 10m, 2h, 1d)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('1h')
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('gw_winners')
            .setLabel('Número de Vencedores')
            .setStyle(TextInputStyle.Short)
            .setValue('1')
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('gw_desc')
            .setLabel('Descrição (Opcional)')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(winnersInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};