// Substitua o conteúdo em: handlers/buttons/mod_open_audit_panel.js
const db = require('../../database.js');
const generateModAuditPanel = require('../../ui/modAuditPanel.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

async function getAuditStats(guildId, days) {
    const interval = `${days} days`;

    const [totalRes, topActionRes, moderatorRankRes, memberRankRes, breakdownRes] = await Promise.all([
        db.query(`SELECT COUNT(*) FROM moderation_logs WHERE guild_id = $1 AND created_at >= NOW() - $2::interval`, [guildId, interval]),
        db.query(`SELECT action, COUNT(*) as count FROM moderation_logs WHERE guild_id = $1 AND created_at >= NOW() - $2::interval GROUP BY action ORDER BY count DESC LIMIT 1`, [guildId, interval]),
        db.query(`SELECT moderator_id, COUNT(*) as count FROM moderation_logs WHERE guild_id = $1 AND created_at >= NOW() - $2::interval GROUP BY moderator_id ORDER BY count DESC LIMIT 3`, [guildId, interval]),
        db.query(`SELECT user_id, COUNT(*) as count FROM moderation_logs WHERE guild_id = $1 AND created_at >= NOW() - $2::interval GROUP BY user_id ORDER BY count DESC LIMIT 3`, [guildId, interval]),
        db.query(`SELECT action, COUNT(*) as count FROM moderation_logs WHERE guild_id = $1 AND created_at >= NOW() - $2::interval GROUP BY action ORDER BY action ASC`, [guildId, interval])
    ]);

    return {
        totalActions: parseInt(totalRes.rows[0].count, 10),
        topAction: topActionRes.rows[0],
        moderatorRank: moderatorRankRes.rows,
        memberRank: memberRankRes.rows,
        actionBreakdown: breakdownRes.rows
    };
}

module.exports = {
    customId: 'mod_open_audit_panel',
    async execute(interaction) {
        await interaction.deferUpdate();
        const period = 7; // Padrão
        const stats = await getAuditStats(interaction.guild.id, period);
        const panel = generateModAuditPanel(stats, period);

        await interaction.editReply({
            components: panel, // CORRIGIDO AQUI
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};