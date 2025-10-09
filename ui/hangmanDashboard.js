// Substitua o conteúdo em: ui/hangmanDashboard.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Arte ASCII para os estágios da forca
const HANGMAN_STAGES = [
    '\u200B', // CORREÇÃO: Usando um caractere invisível (zero-width space) em vez de um espaço normal
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```', // 6 vidas
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```', // 5 vidas
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```', // 4 vidas
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```', // 3 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```', // 2 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```', // 1 vida
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```'  // 0 vidas
];

const ALPHABET_ROWS = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY', 'Z'];

module.exports = function generateHangmanDashboardV2(gameData) {
    const { lives = 6, secret_word = '', guessed_letters = '', action_log = '', user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? ` ${letter} ` : ' __ '))
        .join('');

    const wrongLetters = guessed_letters.split('').filter(l => !secret_word.includes(l)).join(', ') || 'Nenhuma';
    const logText = action_log || '> O jogo começou! Boa sorte.';

    let title = "## 💀 Jogo da Forca";
    let statusText = `> Jogo iniciado por <@${user_id}>. Use os botões abaixo para adivinhar a palavra!`;

    if (status === 'won') {
        title = "## 🎉 Você Venceu! 🎉";
        statusText = `> Parabéns! A palavra era **${secret_word}**.`;
    } else if (status === 'lost' || status === 'given_up') {
        title = "## 💀 Fim de Jogo! 💀";
        statusText = `> A palavra secreta era **${secret_word}**.`;
    }

    // Gera as fileiras de botões do alfabeto
    const isGameActive = status === 'playing';
    const guessed = guessed_letters.split('');
    const letterButtons = ALPHABET_ROWS.map(rowString => ({
        type: 1,
        components: rowString.split('').map(letter => ({
            type: 2,
            style: guessed.includes(letter) ? 2 : 1, // Secondary (cinza) se já foi chutada, Primary (azul) senão
            label: letter,
            custom_id: `hangman_guess_${letter}`,
            disabled: !isGameActive || guessed.includes(letter)
        }))
    }));

    // Retorna a estrutura V2 completa
    return {
        components: [
            {
                type: 17,
                components: [
                    { type: 10, content: title },
                    { type: 10, content: statusText },
                    { type: 14, divider: true, spacing: 1 },
                    {
                        type: 9,
                        accessory: {
                            type: 2,
                            style: 4, // Danger
                            label: "Desistir",
                            emoji: { name: "🏳️" },
                            custom_id: "hangman_give_up",
                            disabled: !isGameActive
                        },
                        components: [
                            { type: 10, content: HANGMAN_STAGES[7 - (lives + 1)] || HANGMAN_STAGES[7] },
                            { type: 10, content: `### ${displayWord}` },
                            { type: 10, content: `> ❤️ **Vidas:** ${lives}/6 | 👎 **Letras Erradas:** ${wrongLetters}` },
                        ]
                    },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: "### Histórico da Partida" },
                    { type: 10, content: logText },
                    { type: 14, divider: true, spacing: 2 },
                    ...letterButtons
                ]
            }
        ],
        // As flags agora são retornadas junto com os componentes para garantir que sejam aplicadas corretamente.
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};