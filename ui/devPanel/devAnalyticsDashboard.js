// Crie em: ui/devPanel/devAnalyticsDashboard.js
module.exports = function generateDevAnalyticsDashboard(stats, client) {
    const { general, topCommands, topButtons, topModules, topGuilds } = stats;

    const topCommandsList = topCommands.map(c => `> • \`/${c.name}\` - **${c.count}** usos`).join('\n') || '> Nenhuma atividade.';
    const topButtonsList = topButtons.map(b => `> • \`${b.name}\` - **${b.count}** cliques`).join('\n') || '> Nenhuma atividade.';
    const topModulesList = topModules.map(m => `> • **${m.module}** - **${m.count}** interações`).join('\n') || '> Nenhuma atividade.';
    
    const topGuildsList = topGuilds.map(g => {
        const guild = client.guilds.cache.get(g.guild_id);
        return `> • **${guild?.name || 'Servidor Desconhecido'}** - **${g.count}** interações`;
    }).join('\n') || '> Nenhuma atividade.';

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 📊 Analytics Global - Últimos 7 Dias" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 10, "content":
                        `> **Total de Interações:** \`${general.total_interactions}\`\n` +
                        `> **Servidores Ativos:** \`${general.active_guilds}\`\n` +
                        `> **Utilizadores Ativos:** \`${general.active_users}\``
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🚀 Top 5 Comandos Mais Usados" },
                { "type": 10, "content": topCommandsList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🖱️ Top 5 Botões Mais Clicados" },
                { "type": 10, "content": topButtonsList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📦 Top 5 Módulos Mais Ativos" },
                { "type": 10, "content": topModulesList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🏢 Top 5 Servidores Mais Ativos" },
                { "type": 10, "content": topGuildsList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "devpanel" }
                    ]
                }
            ]
        }
    ];
};