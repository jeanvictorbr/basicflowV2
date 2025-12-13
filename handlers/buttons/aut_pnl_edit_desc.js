const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_pnl_edit_desc_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const modal = new ModalBuilder().setCustomId(`modal_pnl_desc_${panelId}`).setTitle('Editar Descrição');
        
        const input = new TextInputBuilder()
            .setCustomId('input_desc')
            .setLabel("Nova Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};