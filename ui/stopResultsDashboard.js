// Crie este arquivo em: ui/stopResultsDashboard.js
const V2_FLAG = 1 << 15;

module.exports = function generateStopResults(game, submissions = []) {
    const { letter, stopper_id } = game;

    const results = submissions.reduce((acc, sub) => {
        if (!acc[sub.user_id]) {
            acc[sub.user_id] = [];
        }
        acc[sub.user_id].push(`> • **${sub.category}:** \`${sub.word}\``);
        return acc;
    }, {});

    const resultFields = Object.keys(results).flatMap(userId => ([
        { type: 10, content: `### 👤 Respostas de <@${userId}>` },
        { type: 10, content: results[userId].join('\n') },
        { type: 14, divider: true, spacing: 1 },
    ]));


    return {
        components: [
            {
                type: 17,
                accent_color: 15844367,
                components: [
                    { type: 10, content: `## 🏆 Fim de Rodada! (Letra **${letter}**)` },
                    { type: 10, content: `> A rodada foi encerrada por <@${stopper_id}>! Hora de validar as respostas.` },
                    { type: 14, divider: true, spacing: 2 },
                    ...resultFields
                ]
            }
        ],
        flags: V2_FLAG
    };
};