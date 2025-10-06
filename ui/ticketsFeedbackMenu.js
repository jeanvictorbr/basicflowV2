// Crie em: ui/ticketsFeedbackMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function formatRating(rating) {
    return '⭐'.repeat(rating) + '✩'.repeat(5 - rating);
}

module.exports = function generateFeedbackMenu(feedbackData) {
    const { avgRating, totalRatings, feedbacks, page, totalPages } = feedbackData;

    const statsText = `> **Média Geral:** ${formatRating(Math.round(avgRating))} (${avgRating.toFixed(2)}) | **Total de Avaliações:** \`${totalRatings}\``;

    const feedbackList = feedbacks.length > 0
        ? feedbacks.map(fb => {
            const comment = fb.comment ? `\n> └─ "${fb.comment.substring(0, 100)}${fb.comment.length > 100 ? '...' : ''}"` : '';
            return `> ${formatRating(fb.rating)} por <@${fb.user_id}> em <t:${Math.floor(new Date(fb.created_at).getTime() / 1000)}:R>${comment}`;
        }).join('\n\n')
        : '> Nenhuma avaliação recebida ainda.';

    const components = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`feedback_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId('tickets_open_premium_menu').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️'),
        new ButtonBuilder().setCustomId(`feedback_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 16766720,
            "components": [
                { "type": 10, "content": "## 📊 Painel de Avaliações de Atendimento" },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": statsText },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Últimas Avaliações Recebidas:" },
                { "type": 10, "content": feedbackList },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": components.toJSON().components }
            ]
        }
    ];
};