// Crie em: handlers/buttons/store_analytics_period.js
const generateAnalyticsDashboard = require('../../ui/store/analyticsDashboard.js');
const { getAnalyticsData } = require('./store_open_analytics.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_analytics_period_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const period = parseInt(interaction.customId.split('_')[3], 10);
        
        // Se o 'period' não for um número (caso do botão "Todo o Período"), ele será NaN.
        // A função getAnalyticsData já está preparada para tratar isso como "sem filtro de data".
        const stats = await getAnalyticsData(interaction.guild.id, isNaN(period) ? null : period);
        const dashboard = generateAnalyticsDashboard(stats, isNaN(period) ? 'all' : period, interaction);

        await interaction.editReply({
            components: dashboard,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};