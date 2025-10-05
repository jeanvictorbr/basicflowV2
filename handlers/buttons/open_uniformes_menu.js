// handlers/buttons/open_uniformes_menu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'open_uniformes_menu', // CORRIGIDO
    async execute(interaction) {
        const backButton = new ButtonBuilder().setCustomId('main_menu_back').setLabel('Voltar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            content: 'Módulo de Uniformes em desenvolvimento.',
            embeds: [],
            components: [new ActionRowBuilder().addComponents(backButton)]
        });
    }
};