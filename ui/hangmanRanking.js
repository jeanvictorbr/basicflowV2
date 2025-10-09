// Crie este arquivo em: ui/hangmanRanking.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
const ITEMS_PER_PAGE = 10;

module.exports = function generateHangmanRanking(rankingData, page = 0) {
    const totalPages = Math.ceil(rankingData.length / ITEMS_PER_PAGE);
    const paginatedData = rankingData.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const medals = ['🥇', '🥈', '🥉'];
    const rankingList = paginatedData.map((player, index) => {
        const position = page * ITEMS_PER_PAGE + index + 1;
        const medal = medals[position - 1] || `**${position}.**`;
        return `${medal} <@${player.user_id}> - \`${player.points}\` vitórias`;
    }).join('\n');

    return {
        components: [
            {
                type: 17,
                accent_color: 15844367, // Gold
                components: [
                    { type: 10, content: "## 🏆 Ranking da Forca" },
                    { type: 10, content: `> Os melhores jogadores do servidor! Página ${page + 1} de ${totalPages || 1}.` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: rankingList || "> Ninguém pontuou no ranking ainda." },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 2, label: "Anterior", custom_id: `hangman_ranking_page_${page - 1}`, disabled: page === 0 },
                            { type: 2, style: 2, label: "Próxima", custom_id: `hangman_ranking_page_${page + 1}`, disabled: page + 1 >= totalPages }
                        ]
                    }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};