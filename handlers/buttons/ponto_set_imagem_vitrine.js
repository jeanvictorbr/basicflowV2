// handlers/buttons/ponto_set_imagem_vitrine.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const hasFeature = require('../../utils/featureCheck.js');

module.exports = {
    customId: 'ponto_set_imagem_vitrine',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'CUSTOM_VISUALS')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('modal_ponto_imagem_vitrine').setTitle('Definir Imagem do Painel');
        const input = new TextInputBuilder().setCustomId('input_url').setLabel("URL da imagem do painel de ponto").setStyle(TextInputStyle.Short).setPlaceholder("https://i.imgur.com/imagem.png").setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};