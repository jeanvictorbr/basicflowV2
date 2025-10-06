// Crie/Substitua em: handlers/buttons/registros_set_imagem_vitrine.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const isPremiumActive = require('../../utils/premiumCheck.js'); // Caminho corrigido

module.exports = {
    customId: 'registros_set_imagem_vitrine',
    async execute(interaction) {
        const isPremium = await isPremiumActive(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('modal_registros_imagem_vitrine').setTitle('Definir Imagem da Vitrine de Registros');
        const imagemInput = new TextInputBuilder().setCustomId('input_imagem').setLabel("URL da imagem para a vitrine").setStyle(TextInputStyle.Short).setPlaceholder("https://i.imgur.com/imagem.png").setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(imagemInput));
        await interaction.showModal(modal);
    }
};