// Substitua o conteúdo em: ui/modAuditPanel.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateModAuditPanel(stats, period) {
    const { totalActions, topAction, moderatorRank, memberRank, actionBreakdown } = stats;

    const medals = ['🥇', '🥈', '🥉'];

    const moderatorList = moderatorRank.length > 0
        ? moderatorRank.map((m, i) => `${medals[i] || '▫️'} <@${m.moderator_id}> - **${m.count}** ações`).join('\n')
        : '> Nenhuma atividade de moderação registrada.';

    const memberList = memberRank.length > 0
        ? memberRank.map((m, i) => `${medals[i] || '▫️'} <@${m.user_id}> - **${m.count}** punições`).join('\n')
        : '> Nenhum membro foi punido no período.';

    const topActionPercentage = totalActions > 0 ? ((topAction?.count || 0) / totalActions * 100).toFixed(1) : 0;
    const topActionText = topAction ? `\`${topAction.action}\` (${topActionPercentage}%)` : '`N/A`';

    const actionBreakdownText = actionBreakdown.length > 0
        ? actionBreakdown.map(a => `**${a.action}:** \`${a.count}\``).join(' | ')
        : 'Nenhuma';
        
    const periodButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("mod_audit_set_period_7").setLabel("Últimos 7 dias").setStyle(ButtonStyle.Secondary).setDisabled(period === 7),
        new ButtonBuilder().setCustomId("mod_audit_set_period_30").setLabel("Últimos 30 dias").setStyle(ButtonStyle.Secondary).setDisabled(period === 30)
    );

    const backButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("mod_open_premium_hub").setLabel("Voltar").setStyle(ButtonStyle.Secondary).setEmoji("↩️")
    );

    return [
        {
            "type": 17,
            "accent_color": 5793266,
            "components": [
                { "type": 10, "content": `## 📊 Auditoria da Equipe - Últimos ${period} dias` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": `**Resumo Geral:**\n> **Total de Ações:** \`${totalActions}\`\n> **Ação Predominante:** ${topActionText}` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": `**Distribuição de Ações:**\n> ${actionBreakdownText}` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": `**🏆 Ranking de Moderadores**\n${moderatorList}` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": `**🎯 Membros Mais Punidos**\n${memberList}` },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": periodButtons.toJSON().components },
                { "type": 1, "components": backButton.toJSON().components }
            ]
        }
    ];
};