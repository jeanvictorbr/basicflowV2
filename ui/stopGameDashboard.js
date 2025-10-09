// Substitua o conteúdo em: ui/stopGameDashboard.js
const V2_FLAG = 1 << 15;

function createButtonRows(buttons) { /* ... (código inalterado) ... */ }

module.exports = function generateStopDashboard(game, submissions = []) {
    // ... (lógica anterior inalterada) ...
    
    // Altere apenas o retorno final
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