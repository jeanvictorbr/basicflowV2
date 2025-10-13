// Crie em: handlers/buttons/global_ranking_page_.js
const db = require('../../database.js');
const generateGlobalRankingMenu = require('../../ui/globalRankingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

const getRankingData = async (type, page = 0, itemsPerPage = 10) => {
    const offset = page * itemsPerPage;
    const table = type === 'ponto' ? 'ponto_leaderboard' : `${type}_ranking`;
    const valueColumn = type === 'ponto' ? 'total_ms' : 'points';

    const [totalCountResult, rankingResult] = await Promise.all([
        db.query(`SELECT COUNT(DISTINCT user_id) as count FROM ${table}`),
        db.query(`
            WITH UserGuildValues AS (
                SELECT user_id, guild_id, ${valueColumn},
                       ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY ${valueColumn} DESC) as rn
                FROM ${table}
            ),
            GlobalTotals AS (
                SELECT user_id, SUM(${valueColumn}) as global_total
                FROM ${table}
                GROUP BY user_id
            )
            SELECT gt.user_id, gt.global_total, ugv.guild_id
            FROM GlobalTotals gt
            JOIN UserGuildValues ugv ON gt.user_id = ugv.user_id AND ugv.rn = 1
            ORDER BY gt.global_total DESC
            LIMIT $1 OFFSET $2;
        `, [itemsPerPage, offset])
    ]);

    return {
        ranking: rankingResult.rows,
        total: parseInt(totalCountResult.rows[0].count, 10)
    };
}

module.exports = {
    customId: 'global_ranking_page_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const [,,, type, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr, 10);

        if (isNaN(page) || page < 0) return;

        const { ranking, total } = await getRankingData(type, page);
        
        await interaction.editReply({
            components: await generateGlobalRankingMenu(interaction.client, type, ranking, total, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};