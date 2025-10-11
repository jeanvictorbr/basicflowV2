// Crie em: ui/suggestionVitrine.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateSuggestionVitrine(settings) {
    const defaultImage = 'https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e9b5ca&is=68e8644a&hm=e884e0f49fe63d1c0cd2b6b0a2ab52245243c7c74064d8c8186383a6fc2c1d3a&=&format=webp&quality=lossless';

    const embed = new EmbedBuilder()
        .setColor('#F1C40F') // Amarelo
        .setTitle('Central de Sugestões da Comunidade')
        .setDescription('Tem uma ideia para melhorar nosso servidor? Queremos ouvi-la!\n\nClique no botão abaixo para compartilhar sua sugestão com a equipe e com a comunidade.')
        .setImage(settings.suggestions_vitrine_image || defaultImage);

    const button = new ButtonBuilder()
        .setCustomId('suggestions_start')
        .setLabel('Fazer uma Sugestão')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💡');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};