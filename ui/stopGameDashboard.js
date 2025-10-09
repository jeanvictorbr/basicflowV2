// Substitua o conteúdo em: ui/stopGameDashboard.js
const V2_FLAG = 1 << 15;

function createButtonRows(buttons) {
    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
        rows.push({ type: 1, components: buttons.slice(i, i + 5) });
    }
    return rows;
}

module.exports = function generateStopDashboard(game, submissions = []) {
    const { letter, categories, status, starter_id, stopper_id } = game;
    const isGameActive = status === 'playing';

    const categoryButtons = categories.split(',').map(cat => ({
        type: 2,
        style: 1,
        label: cat.trim(),
        custom_id: `stop_category_${cat.trim()}`,
        disabled: !isGameActive
    }));

    const categoryButtonRows = createButtonRows(categoryButtons);

    const playerSubmissions = submissions.reduce((acc, sub) => {
        if (!acc[sub.user_id]) {
            acc[sub.user_id] = [];
        }
        acc[sub.user_id].push(`**${sub.category}**`);
        return acc;
    }, {});

    let submissionText = Object.keys(playerSubmissions).map(userId => 
        `> 👤 <@${userId}> preencheu: ${playerSubmissions[userId].length}/${categoryButtons.length}`
    ).join('\n');

    if (!submissionText) {
        submissionText = '> Aguardando os jogadores preencherem as categorias...';
    }

    return {
        components: [
            {
                type: 17,
                accent_color: 5814783,
                components: [
                    { type: 10, content: `## 🛑 Jogo Stop! - A letra é **${letter}**` },
                    { type: 10, content: `> Clique em uma categoria para preencher. O primeiro a preencher tudo pode clicar em **STOP!**.` },
                    { type: 14, divider: true, spacing: 1 },
                    ...categoryButtonRows,
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 4, label: "STOP!", emoji: { name: "✋" }, custom_id: "stop_press", disabled: !isGameActive }
                        ]
                    },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: "### Progresso dos Jogadores:" },
                    { type: 10, content: submissionText },
                ]
            }
        ],
        flags: V2_FLAG
    };
};