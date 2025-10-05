// handlers/buttons/ausencia_set_imagem.js
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'ausencia_set_imagem',
    async execute(interaction) {
        // Cria o Modal (pop-up)
        const modal = new ModalBuilder()
            .setCustomId('modal_ausencia_imagem')
            .setTitle('Alterar Imagem da Vitrine');

        // Cria o campo de input para a URL
        const imageUrlInput = new TextInputBuilder()
            .setCustomId('input_url')
            .setLabel("URL da imagem (link direto)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('https://i.imgur.com/seu-link.png')
            .setRequired(true);

        // Adiciona o input ao modal
        const actionRow = new ActionRowBuilder().addComponents(imageUrlInput);
        modal.addComponents(actionRow);

        // Mostra o modal para o usuário
        await interaction.showModal(modal);
    }
};