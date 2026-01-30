// ui/suggestionVitrine.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateSuggestionVitrine(settings) {
    
    const embed = new EmbedBuilder()
        .setColor('#F1C40F') // Amarelo
        .setTitle('Central de Sugestões da Comunidade')
        .setDescription('Tem uma ideia para melhorar nosso servidor? Queremos ouvi-la!\n\nClique no botão abaixo para compartilhar sua sugestão com a equipe e com a comunidade.');

    // Lógica: Usa a imagem configurada, ou nenhuma se não houver configuração.
    // Verificamos ambas as variações de nome de coluna por garantia
    const imageUrl = settings.suggestions_vitrine_image || settings.vitrine_image;

    if (imageUrl) {
        embed.setImage(imageUrl);
    }

    const button = new ButtonBuilder()
        .setCustomId('suggestions_start')
        .setLabel('Fazer uma Sugestão')
        .setStyle(ButtonStyle.Success)
        .setEmoji('💡');

    const row = new ActionRowBuilder().addComponents(button);

    return { embeds: [embed], components: [row] };
};