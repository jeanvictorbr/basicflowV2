// Crie este arquivo em: ui/stopGameDashboard.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Função auxiliar para dividir os botões em fileiras de 5
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

    // Cria os botões de categoria dinamicamente
    const categoryButtons = categories.split(',').map(cat => ({
        type: 2,
        style: 1, // Primary
        label: cat.trim(),
        custom_id: `stop_category_${cat.trim()}`,
        disabled: !isGameActive
    }));

    const categoryButtonRows = createButtonRows(categoryButtons);

    // Agrupa as submissões por jogador
    const playerSubmissions = submissions.reduce((acc, sub) => {
        if (!acc[sub.user_id]) {
            acc[sub.user_id] = [];
        }
        acc[sub.user_id].push(`**${sub.category}:** ${sub.word}`);
        return acc;
    }, {});

    let submissionText = Object.keys(playerSubmissions).map(userId => 
        `> 👤 <@${userId}> preencheu: ${playerSubmissions[userId].length}/${categoryButtons.length}`
    ).join('\n');

    if (!submissionText) {
        submissionText = '> Aguardando os jogadores preencherem as categorias...';
    }

    // Monta o painel final
    return {
        components: [
            {
                type: 17,
                accent_color: 5814783,
                components: [
                    { type: 10, content: `## 🛑 Jogo Stop! - A letra é **${letter}**` },
                    { type: 10, content: `> Clique em uma categoria para preencher sua palavra. O primeiro a preencher tudo e clicar em **STOP!** encerra a rodada.` },
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
                    { type: 10, content: "### Respostas dos Jogadores:" },
                    { type: 10, content: submissionText },
                ]
            }
        ],
        flags: V2_FLAG
    };
};