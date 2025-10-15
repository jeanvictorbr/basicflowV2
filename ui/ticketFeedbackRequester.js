// Substitua o conteúdo em: ui/ticketFeedbackRequester.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateFeedbackRequester(ticket) {
    const embed = new EmbedBuilder()
        .setColor('Gold')
        .setTitle('⭐ Avalie nosso Atendimento')
        .setDescription('Sua opinião é muito importante para nós! Por favor, avalie o suporte que você recebeu clicando em uma das estrelas abaixo.');
    
    // CORREÇÃO: Adicionamos o ticket.guild_id ao customId de cada botão
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`feedback_star_1_${ticket.channel_id}_${ticket.guild_id}`).setLabel('1').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
        new ButtonBuilder().setCustomId(`feedback_star_2_${ticket.channel_id}_${ticket.guild_id}`).setLabel('2').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
        new ButtonBuilder().setCustomId(`feedback_star_3_${ticket.channel_id}_${ticket.guild_id}`).setLabel('3').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
        new ButtonBuilder().setCustomId(`feedback_star_4_${ticket.channel_id}_${ticket.guild_id}`).setLabel('4').setStyle(ButtonStyle.Secondary).setEmoji('⭐'),
        new ButtonBuilder().setCustomId(`feedback_star_5_${ticket.channel_id}_${ticket.guild_id}`).setLabel('5').setStyle(ButtonStyle.Secondary).setEmoji('⭐')
    );

    return {
        content: 'Como foi sua experiência?',
        embeds: [embed],
        components: [buttons]
    };
};