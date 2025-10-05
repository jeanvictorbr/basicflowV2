// Crie este arquivo em: handlers/buttons/registros_set_imagem_vitrine.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    customId: 'registros_set_imagem_vitrine',
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_registros_imagem_vitrine').setTitle('Definir Imagem da Vitrine');
        const imagemInput = new TextInputBuilder().setCustomId('input_imagem').setLabel("URL da imagem para a vitrine").setStyle(TextInputStyle.Short).setPlaceholder("https://i.imgur.com/imagem.png").setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(imagemInput));
        await interaction.showModal(modal);
    }
};