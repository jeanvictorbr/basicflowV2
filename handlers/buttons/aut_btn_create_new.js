const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    customId: 'aut_btn_create_new',
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_aut_btn_create')
            .setTitle('Novo Painel de Cargos');

        const titleInput = new TextInputBuilder()
            .setCustomId('input_panel_title')
            .setLabel("Título do Painel")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Ex: Selecione seus Jogos")
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('input_panel_desc')
            .setLabel("Descrição")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Ex: Use o menu abaixo para pegar cargos...")
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};