// ui/ausenciaVitrineEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateVitrine(settings) {
    // Define a imagem padrão
    const defaultImage = 'https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless';

    const embed = new EmbedBuilder()
        .setColor('#FF4500') // Laranja
        .setTitle('Central de Ausências')
        .setDescription('Para solicitar uma ausência, clique no botão abaixo e preencha o formulário.')
        // Usa a imagem configurada OU a imagem padrão se a primeira não existir
        .setImage(settings.ausencias_imagem_vitrine || defaultImage);

    const button = new ButtonBuilder()
        .setCustomId('ausencia_request_start')
        .setLabel('Solicitar Ausência')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🏖️');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};