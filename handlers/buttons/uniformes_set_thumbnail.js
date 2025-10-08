// handlers/buttons/uniformes_set_thumbnail.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const hasFeature = require('../../utils/featureCheck.js');

module.exports = {
    customId: 'uniformes_set_thumbnail',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('modal_uniformes_thumbnail').setTitle('Definir Thumbnail da Vitrine');
        const input = new TextInputBuilder().setCustomId('input_url').setLabel("URL da imagem (thumbnail)").setStyle(TextInputStyle.Short).setPlaceholder("https://i.imgur.com/imagem.png").setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};