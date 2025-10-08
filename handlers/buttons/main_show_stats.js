// handlers/buttons/main_show_stats.js
const db = require('../../database.js');
const hasFeature = require('../../utils/featureCheck.js');
const generateStatsDashboard = require('../../ui/statsDashboard.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

async function getStats(guildId, days) {
    const interval = `${days} days`;

    // Ponto
    const pontoRes = await db.query(`
        SELECT
            COALESCE(SUM(duration_ms), 0) as total_hours,
            COUNT(DISTINCT user_id) as active_members
        FROM ponto_history
        WHERE guild_id = $1 AND end_time >= NOW() - $2::interval
    `, [guildId, interval]);

    const topMembersRes = await db.query(`
        SELECT user_id, SUM(duration_ms) as total_duration
        FROM ponto_history
        WHERE guild_id = $1 AND end_time >= NOW() - $2::interval
        GROUP BY user_id
        ORDER BY total_duration DESC
        LIMIT 5
    `, [guildId, interval]);

    // Tickets
    const ticketsOpenedRes = await db.query(`
        SELECT COUNT(*) FROM tickets
        WHERE guild_id = $1 AND (channel_id::bigint >> 22) + 1420070400000 >= EXTRACT(EPOCH FROM NOW() - $2::interval) * 1000
    `, [guildId, interval]);

    const ticketsClosedRes = await db.query(`
        SELECT COUNT(*) FROM tickets
        WHERE guild_id = $1 AND status = 'closed' AND closed_at >= NOW() - $2::interval
    `, [guildId, interval]);

    // Registros
    const regsApprovedRes = await db.query(`
        SELECT COUNT(*) FROM registrations_history
        WHERE guild_id = $1 AND status = 'approved' AND created_at >= NOW() - $2::interval
    `, [guildId, interval]);
    
    const regsRejectedRes = await db.query(`
        SELECT COUNT(*) FROM registrations_history
        WHERE guild_id = $1 AND status = 'rejected' AND created_at >= NOW() - $2::interval
    `, [guildId, interval]);

    return {
        totalHours: pontoRes.rows[0].total_hours,
        activeMembersCount: pontoRes.rows[0].active_members,
        topMembers: topMembersRes.rows,
        ticketsOpened: ticketsOpenedRes.rows[0].count,
        ticketsClosed: ticketsClosedRes.rows[0].count,
        regsApproved: regsApprovedRes.rows[0].count,
        regsRejected: regsRejectedRes.rows[0].count,
    };
}


module.exports = {
    customId: 'main_show_stats',
    async execute(interaction) {
        if (!await hasFeature(interaction.guild.id, 'STATS')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium.', ephemeral: true });
        }

        await interaction.deferUpdate();
        
        const weeklyStats = await getStats(interaction.guild.id, 7);
        const dashboard = generateStatsDashboard(weeklyStats, 'semana');

        await interaction.editReply({
            components: dashboard,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
    getStats
};