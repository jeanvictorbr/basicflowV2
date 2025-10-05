// ui/ticketPainelEmbed.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateTicketPainel(settings) {
    const embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Central de Atendimento')
        .setDescription('Precisa de ajuda? Clique no botão abaixo para abrir um ticket e nossa equipe de suporte irá atendê-lo.')
        .setThumbnail(settings.tickets_thumbnail_url);

    const button = new ButtonBuilder()
        .setCustomId('ticket_open')
        .setLabel('Abrir Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩');

    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] };
};