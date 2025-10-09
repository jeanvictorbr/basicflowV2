// Crie este arquivo em: ui/stopRanking.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const ITEMS_PER_PAGE = 10;

module.exports = function generateStopRanking(rankingData, page = 0) {
    const totalPages = Math.ceil(rankingData.length / ITEMS_PER_PAGE);
    const paginatedData = rankingData.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const medals = ['🥇', '🥈', '🥉'];
    const rankingList = paginatedData.map((player, index) => {
        const position = page * ITEMS_PER_PAGE + index + 1;
        const medal = medals[position - 1] || `**${position}.**`;
        return `${medal} <@${player.user_id}> - \`${player.points}\` pontos`;
    }).join('\n');

    return {
        components: [
            {
                type: 17,
                accent_color: 15105570, // Orange
                components: [
                    { type: 10, content: "## 🏆 Ranking do Stop!" },
                    { type: 10, content: `> Os jogadores mais rápidos e criativos! Página ${page + 1} de ${totalPages || 1}.` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: rankingList || "> Ninguém pontuou no ranking ainda." },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 2, label: "Anterior", custom_id: `stop_ranking_page_${page - 1}`, disabled: page === 0 },
                            { type: 2, style: 2, label: "Próxima", custom_id: `stop_ranking_page_${page + 1}`, disabled: page + 1 >= totalPages }
                        ]
                    }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};