// ui/statsDashboard.js
const { formatDuration } = require('../utils/formatDuration.js');

module.exports = function generateStatsDashboard(stats, period) {
    const periodText = period === 'semana' ? 'Últimos 7 dias' : 'Últimos 30 dias';
    const topMembersText = stats.topMembers.length > 0
        ? stats.topMembers.map((m, i) => `**${i + 1}.** <@${m.user_id}> - \`${formatDuration(m.total_duration)}\``).join('\n')
        : 'Ninguém bateu o ponto neste período.';

    return [
        {
            "type": 17, "accent_color": 5793266,
            "components": [
                {
                    "type": 10, "content": `## 📊 Estatísticas do Servidor`
                },
                {
                    "type": 10, "content": `> Exibindo dados dos **${periodText}**`
                },
                { "type": 14, "divider": true, "spacing": 2 },
                // Seção Bate-Ponto
                {
                    "type": 10, "content": "⏰ **BATE-PONTO**"
                },
                {
                    "type": 10, "content": `> **Total de Horas:** \`${formatDuration(stats.totalHours)}\`\n> **Membros Ativos:** \`${stats.activeMembersCount}\``
                },
                { "type": 14, "divider": true, "spacing": 1 },
                // Seção Top 5
                {
                    "type": 10, "content": "🏆 **TOP 5 MAIS ATIVOS**"
                },
                { 
                    "type": 10, "content": topMembersText 
                },
                { "type": 14, "divider": true, "spacing": 1 },
                // Seção Tickets
                {
                    "type": 10, "content": "🚨 **TICKETS**"
                },
                {
                    "type": 10, "content": `> **Abertos:** \`${stats.ticketsOpened}\`\n> **Fechados:** \`${stats.ticketsClosed}\``
                },
                { "type": 14, "divider": true, "spacing": 1 },
                // Seção Registros
                {
                    "type": 10, "content": "📂 **REGISTROS**"
                },
                {
                    "type": 10, "content": `> **Aprovados:** \`${stats.regsApproved}\`\n> **Recusados:** \`${stats.regsRejected}\``
                },
                { "type": 14, "divider": true, "spacing": 2 },
                // Botões de Ação
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Semana", "custom_id": "stats_show_weekly", "disabled": period === 'semana' },
                        { "type": 2, "style": 2, "label": "Mês", "custom_id": "stats_show_monthly", "disabled": period === 'mes' },
                        { "type": 2, "style": 4, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }
                    ]
                }
            ]
        }
    ];
};