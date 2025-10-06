// ui/ticketPainelEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateTicketPainel(settings) {
    // Imagem padrão adicionada
    const defaultImage = 'https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless';

    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Central de Atendimento')
        .setDescription('Precisa de ajuda? Clique no botão abaixo para abrir um ticket e nossa equipe de suporte irá atendê-lo.')
        // Lógica atualizada: usa a thumbnail configurada ou a imagem padrão
        .setImage(settings.tickets_thumbnail_url || defaultImage);

    const button = new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] };
};