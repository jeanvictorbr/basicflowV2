// Crie este arquivo em: ui/stopVotingDashboard.js
const V2_FLAG = 1 << 15;

module.exports = function generateStopVoting(game, submissions = []) {
    const { letter, stopper_id } = game;

    const results = submissions.reduce((acc, sub) => {
        if (!acc[sub.category]) {
            acc[sub.category] = [];
        }
        acc[sub.category].push(sub);
        return acc;
    }, {});

    const categoryFields = Object.keys(results).flatMap(category => {
        const submissionFields = results[category].map(sub => ({
            type: 9,
            accessory: {
                type: 1,
                components: [
                    { type: 2, style: 3, label: "Válido", emoji: { name: "👍" }, custom_id: `stop_vote_${sub.id}_true` },
                    { type: 2, style: 4, label: "Inválido", emoji: { name: "👎" }, custom_id: `stop_vote_${sub.id}_false` }
                ]
            },
            components: [{ type: 10, content: `> **<@${sub.user_id}>:** \`${sub.word}\`` }]
        }));

        return [
            { type: 10, content: `### Categoria: ${category}` },
            ...submissionFields,
            { type: 14, divider: true, spacing: 1 },
        ];
    });

    return {
        components: [
            {
                type: 17,
                accent_color: 15105570, // Orange
                components: [
                    { type: 10, content: `## 🗳️ Votação da Rodada! (Letra **${letter}**)` },
                    { type: 10, content: `> <@${stopper_id}> apertou o STOP! Votem nas respostas abaixo. O admin pode finalizar a votação a qualquer momento.` },
                    { type: 14, divider: true, spacing: 2 },
                    ...categoryFields,
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 1, label: "Finalizar Votação e Calcular Pontos", emoji: { name: "📊" }, custom_id: "stop_calculate_score" }
                        ]
                    }
                ]
            }
        ],
        flags: V2_FLAG
    };
};