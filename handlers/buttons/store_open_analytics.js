// Substitua o conteúdo em: handlers/buttons/store_open_analytics.js
const db = require('../../database.js');
const generateAnalyticsDashboard = require('../../ui/store/analyticsDashboard.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

async function getAnalyticsData(guildId, days) {
    const isAllTime = days === null || isNaN(days);
    const interval = isAllTime ? null : `${days} days`;

    // Constrói as cláusulas WHERE dinamicamente
    const whereClause = isAllTime 
        ? 'WHERE guild_id = $1' 
        : 'WHERE guild_id = $1 AND created_at >= NOW() - $2::interval';
    const queryParams = isAllTime ? [guildId] : [guildId, interval];

    // Adapta a query de TOP produtos
    const topProductsWhereClause = isAllTime
        ? `WHERE guild_id = $1 AND status = 'completed'`
        : `WHERE guild_id = $1 AND status = 'completed' AND created_at >= NOW() - $2::interval`;


    const revenueRes = await db.query(`SELECT SUM(total_amount) as total FROM store_sales_log ${whereClause} AND status = 'completed'`, queryParams);
    const countsRes = await db.query(`SELECT status, COUNT(*) as count FROM store_sales_log ${whereClause} GROUP BY status`, queryParams);
    const topProductsRes = await db.query(`
        SELECT p.value->>'name' as name, COUNT(*) as count
        FROM store_sales_log, jsonb_array_elements(product_details) as p
        ${topProductsWhereClause}
        GROUP BY name
        ORDER BY count DESC
        LIMIT 5;
    `, queryParams);

    return {
        totalRevenue: parseFloat(revenueRes.rows[0]?.total || 0),
        approvedCount: parseInt(countsRes.rows.find(r => r.status === 'completed')?.count || 0, 10),
        cancelledCount: parseInt(countsRes.rows.find(r => r.status === 'cancelled')?.count || 0, 10),
        topProducts: topProductsRes.rows,
    };
}

module.exports = {
    customId: 'store_open_analytics',
    async execute(interaction) {
        await interaction.deferUpdate();
        
        const period = 7; // Padrão
        const stats = await getAnalyticsData(interaction.guild.id, period);
        const dashboard = generateAnalyticsDashboard(stats, period, interaction);

        await interaction.editReply({
            components: dashboard,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
    getAnalyticsData // Exportamos para ser usado pelos filtros
};