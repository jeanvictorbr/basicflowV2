const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_pnl_edit_img_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const modal = new ModalBuilder().setCustomId(`modal_pnl_img_${panelId}`).setTitle('Alterar Imagem');
        
        const input = new TextInputBuilder()
            .setCustomId('input_img')
            .setLabel("URL da Imagem (Link)")
            .setPlaceholder("https://imgur.com/...")
            .setStyle(TextInputStyle.Short)
            .setRequired(false); // Se deixar vazio, remove a imagem

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};