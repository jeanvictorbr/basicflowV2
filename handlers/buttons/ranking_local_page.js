// handlers/buttons/ranking_local_page.js
const db = require('../../database.js');
const generateLocalRankingMenu = require('../../ui/ranking/localRankingMenu.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const ITEMS_PER_PAGE = 10;

const getRankingData = async (guildId, type, page = 0) => {
    const offset = page * ITEMS_PER_PAGE;
    const table = type === 'ponto' ? 'ponto_leaderboard' : `${type}_ranking`;
    const valueColumn = type === 'ponto' ? 'total_ms' : 'points';
    const orderColumn = type === 'ponto' ? 'total_ms' : 'points';

    const [totalCountResult, rankingResult] = await Promise.all([
        db.query(`SELECT COUNT(*) as count FROM ${table} WHERE guild_id = $1`, [guildId]),
        db.query(`SELECT user_id, ${valueColumn} FROM ${table} WHERE guild_id = $1 ORDER BY ${orderColumn} DESC LIMIT $2 OFFSET $3`, [guildId, ITEMS_PER_PAGE, offset])
    ]);

    return {
        ranking: rankingResult.rows,
        total: parseInt(totalCountResult.rows[0].count, 10)
    };
};

module.exports = {
    customId: 'ranking_local_page_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const [,,, type, pageStr] = interaction.customId.split('_');
        const page = parseInt(pageStr, 10);

        if (isNaN(page) || page < 0) return;

        const { ranking, total } = await getRankingData(interaction.guild.id, type, page);

        await interaction.editReply({
            components: generateLocalRankingMenu(type, ranking, total, page, interaction.guild),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    },
    getRankingData
};