// Crie em: handlers/buttons/open_global_ranking.js
const db = require('../../database.js');
const generateGlobalRankingMenu = require('../../ui/globalRankingMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Função auxiliar para buscar os dados
async function getGlobalPontoRanking(page = 0, itemsPerPage = 10) {
    const offset = page * itemsPerPage;
    const [totalCountResult, rankingResult] = await Promise.all([
        db.query('SELECT COUNT(DISTINCT user_id) as count FROM ponto_leaderboard'),
        db.query(`
            WITH UserGuildHours AS (
                SELECT user_id, guild_id, total_ms,
                       ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY total_ms DESC) as rn
                FROM ponto_leaderboard
            ),
            GlobalTotals AS (
                SELECT user_id, SUM(total_ms) as global_total
                FROM ponto_leaderboard
                GROUP BY user_id
            )
            SELECT gt.user_id, gt.global_total, ugh.guild_id
            FROM GlobalTotals gt
            JOIN UserGuildHours ugh ON gt.user_id = ugh.user_id AND ugh.rn = 1
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
    customId: 'open_global_ranking',
    async execute(interaction) {
        await interaction.deferUpdate();

        const { ranking, total } = await getGlobalPontoRanking();
        
        await interaction.editReply({
            components: await generateGlobalRankingMenu(interaction.client, 'ponto', ranking, total, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};