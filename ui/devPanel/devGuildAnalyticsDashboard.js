// Crie em: ui/devPanel/devGuildAnalyticsDashboard.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateGuildAnalyticsDashboard(guild, stats, period) {
    const { summary, topCommands, topButtons, actionLog } = stats;

    const topCommandsList = topCommands.map(c => `> • \`/${c.name}\` - **${c.count}** usos`).join('\n') || '> Nenhuma atividade.';
    const topButtonsList = topButtons.map(b => `> • \`${b.name}\` - **${b.count}** cliques`).join('\n') || '> Nenhuma atividade.';
    
    const actionLogList = actionLog.map(log => {
        const time = `<t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:R>`;
        return `> ${time} - **${log.module}**: <@${log.user_id}> usou \`${log.name}\``;
    }).join('\n') || '> Nenhuma ação registrada.';

    const periodButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_guild_analytics_period_${guild.id}_1`).setLabel("Hoje").setStyle(ButtonStyle.Secondary).setDisabled(period === 1),
        new ButtonBuilder().setCustomId(`dev_guild_analytics_period_${guild.id}_7`).setLabel("7 Dias").setStyle(ButtonStyle.Secondary).setDisabled(period === 7),
        new ButtonBuilder().setCustomId(`dev_guild_analytics_period_${guild.id}_30`).setLabel("30 Dias").setStyle(ButtonStyle.Secondary).setDisabled(period === 30)
    );

    return [
        {
            "type": 17, "accent_color": 3447003,
            "components": [
                { "type": 10, "content": `## 🔍 Atividade do Servidor: ${guild.name}` },
                { "type": 1, "components": periodButtons.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 10, "content":
                        `> **Total de Interações:** \`${summary.total_interactions}\`\n` +
                        `> **Utilizadores Ativos:** \`${summary.active_users}\`\n` +
                        `> **Módulo Mais Usado:** \`${summary.top_module || 'N/A'}\``
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🚀 Top 5 Comandos" },
                { "type": 10, "content": topCommandsList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🖱️ Top 5 Botões" },
                { "type": 10, "content": topButtonsList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📋 Últimas 10 Ações" },
                { "type": 10, "content": actionLogList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "dev_manage_guilds" }
                    ]
                }
            ]
        }
    ];
};