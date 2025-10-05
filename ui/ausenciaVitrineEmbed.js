// ui/ausenciaVitrineEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateVitrine(settings) {
    const embed = new EmbedBuilder()
        .setColor('#FF4500') // Laranja
        .setTitle('Central de Ausências')
        .setDescription('Para solicitar uma ausência, clique no botão abaixo e preencha o formulário.')
        .setImage(settings.ausencias_imagem_vitrine); // Usa a imagem que você configurou

    const button = new ButtonBuilder()
        .setCustomId('ausencia_request_start')
        .setLabel('Solicitar Ausência')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🏖️');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};