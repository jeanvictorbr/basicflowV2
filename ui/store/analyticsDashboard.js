// Substitua o conteúdo em: ui/store/analyticsDashboard.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateAnalyticsDashboard(stats, period, interaction) {
    let periodText = 'Últimos 7 dias';
    if (period === 30) periodText = 'Últimos 30 dias';
    if (period === 'all') periodText = 'Todo o Período';


    const topProductsList = stats.topProducts.length > 0
        ? stats.topProducts.map((p, i) => `> **${i + 1}.** ${p.name} - **${p.count}** vendas`).join('\n')
        : '> Nenhuma venda registrada no período.';

    const statusBreakdown = `> ✅ **Aprovadas:** \`${stats.approvedCount}\`\n> ❌ **Canceladas:** \`${stats.cancelledCount}\``;

    return [
        {
            "type": 17, "accent_color": 5793266,
            "components": [
                { "type": 10, "content": `## 📈 Análise de Vendas - StoreFlow` },
                {
                    "type": 9,
                    "accessory": { "type": 11, "media": { "url": interaction.guild.iconURL() } }, // THUMBNAIL DO SERVIDOR
                    "components": [
                        { "type": 10, "content": `> Exibindo dados de: **${periodText}**` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": "### 📊 KPIs Principais" },
                { "type": 10, "content": `> 💰 **Faturamento Total:** \`R$ ${stats.totalRevenue.toFixed(2)}\`\n> 🛒 **Vendas Concluídas:** \`${stats.approvedCount}\``},
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 🏆 Produtos Mais Vendidos" },
                { "type": 10, "content": topProductsList },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📋 Status das Vendas" },
                { "type": 10, "content": statusBreakdown },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("store_analytics_period_7").setLabel("7 dias").setStyle(ButtonStyle.Secondary).setDisabled(period === 7),
                        new ButtonBuilder().setCustomId("store_analytics_period_30").setLabel("30 dias").setStyle(ButtonStyle.Secondary).setDisabled(period === 30),
                        new ButtonBuilder().setCustomId("store_analytics_period_all").setLabel("Todo o Período").setStyle(ButtonStyle.Secondary).setDisabled(period === 'all'), // BOTÃO NOVO
                        new ButtonBuilder().setCustomId("open_store_menu").setLabel("Voltar").setStyle(ButtonStyle.Danger).setEmoji("↩️")
                    ).toJSON().components
                }
            ]
        }
    ];
};