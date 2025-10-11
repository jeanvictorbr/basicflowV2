// Crie em: ui/suggestionVitrine.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateSuggestionVitrine(settings) {
    const defaultImage = 'https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless';

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