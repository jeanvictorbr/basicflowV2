// Substitua o conteúdo em: ui/devPanel/devGuildAnalyticsDashboard.js
module.exports = function generateDevGuildAnalyticsDashboard(stats, guildName, guildId, period = '7d') {
    // Desestruturação segura (com valores padrão para evitar crash)
    const general = stats.general || { total: 0, unique_users: 0 };
    const topUsers = stats.topUsers || [];
    const topCommands = stats.topCommands || [];
    const topModules = stats.topModules || [];

    const topUsersList = topUsers.map(u => `> • <@${u.user_id}> - **${u.count}** ações`).join('\n') || '> Nenhuma atividade.';
    const topCommandsList = topCommands.map(c => `> • \`/${c.name}\` - **${c.count}** usos`).join('\n') || '> Nenhuma atividade.';
    const topModulesList = topModules.map(m => `> • **${m.module}** - **${m.count}** interações`).join('\n') || '> Nenhuma atividade.';

    let periodText = "Últimos 7 Dias";
    if (period === '30d') periodText = "Últimos 30 Dias";
    if (period === 'total') periodText = "Período Total (Desde o Início)";

    return [
        {
            "type": 17, "accent_color": 3447003,
            "components": [
                { "type": 10, "content": `## 📊 Analytics: ${guildName}` },
                { "type": 10, "content": `> Visualizando dados: **${periodText}**` },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": period === '7d' ? 1 : 2, "label": "7 Dias", "custom_id": `dev_guild_analytics_period_7d_${guildId}`, "disabled": period === '7d' },
                        { "type": 2, "style": period === '30d' ? 1 : 2, "label": "30 Dias", "custom_id": `dev_guild_analytics_period_30d_${guildId}`, "disabled": period === '30d' },
                        { "type": 2, "style": period === 'total' ? 1 : 2, "label": "Total", "custom_id": `dev_guild_analytics_period_total_${guildId}`, "disabled": period === 'total' }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 10, "content":
                        `> **Total Interações:** \`${general.total}\`\n` +
                        `> **Usuários Únicos:** \`${general.unique_users}\``
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🏆 Top Usuários Ativos" },
                { "type": 10, "content": topUsersList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🚀 Comandos Mais Usados" },
                { "type": 10, "content": topCommandsList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📦 Módulos Mais Ativos" },
                { "type": 10, "content": topModulesList },
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