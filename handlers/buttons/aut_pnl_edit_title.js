const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_pnl_edit_title_',
    async execute(interaction) {
        const panelId = interaction.customId.split('_')[4];
        const modal = new ModalBuilder().setCustomId(`modal_pnl_title_${panelId}`).setTitle('Editar Título');
        const input = new TextInputBuilder().setCustomId('input_title').setLabel("Novo Título").setStyle(TextInputStyle.Short).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};