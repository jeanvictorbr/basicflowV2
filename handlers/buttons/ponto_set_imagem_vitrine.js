// Crie/Substitua em: handlers/buttons/ponto_set_imagem_vitrine.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const isPremiumActive = require('../../utils/premiumCheck.js'); // Caminho corrigido

module.exports = {
    customId: 'ponto_set_imagem_vitrine',
    async execute(interaction) {
        const isPremium = await isPremiumActive(interaction.guild.id);
        if (!isPremium) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }

        const modal = new ModalBuilder().setCustomId('modal_ponto_imagem_vitrine').setTitle('Definir Imagem do Painel');
        const input = new TextInputBuilder().setCustomId('input_url').setLabel("URL da imagem do painel de ponto").setStyle(TextInputStyle.Short).setPlaceholder("https://i.imgur.com/imagem.png").setRequired(false);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};