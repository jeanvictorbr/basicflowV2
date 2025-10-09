// Substitua o conteúdo em: ui/hangmanDashboard.js

const HANGMAN_STAGES = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```', // 6 vidas
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```', // 5 vidas
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```', // 4 vidas
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```', // 3 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```', // 2 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```', // 1 vida
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```'  // 0 vidas
];

// LAYOUT DO TECLADO CORRIGIDO (5 BOTÕES POR FILEIRA)
const ALPHABET_ROWS = [
    'ABCDE',
    'FGHIJ',
    'KLMNO',
    'PQRST',
    'UVWXY',
    'Z'
];

module.exports = function generateHangmanDashboard(gameData) {
    const { lives, secret_word, guessed_letters, action_log, user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? `${letter} ` : '_ '))
        .join('');

    const logText = action_log || '> O jogo começou! Boa sorte.';

    let color = 3447003; // Azul
    let title = "Jogo da Forca";
    if (status === 'won') {
        color = 3066993; // Verde
        title = "🎉 Você Venceu! 🎉";
    } else if (status === 'lost') {
        color = 15158332; // Vermelho
        title = "💀 Você Perdeu! 💀";
    }

    const guessed = guessed_letters.split('');
    const keyboardRows = ALPHABET_ROWS.map(rowString => {
        const row = { type: 1, components: [] };
        rowString.split('').forEach(letter => {
            row.components.push({
                type: 2,
                style: guessed.includes(letter) ? 2 : 1,
                label: letter,
                custom_id: `hangman_guess_${letter}`,
                disabled: guessed.includes(letter) || status !== 'playing'
            });
        });
        return row;
    });

    keyboardRows.push({
        type: 1,
        components: [{
            type: 2,
            style: 4,
            label: "Desistir",
            custom_id: 'hangman_give_up',
            emoji: { name: '🏳️' },
            disabled: status !== 'playing'
        }]
    });

    return [{
        type: 17,
        accent_color: color,
        components: [
            { type: 10, content: `## ${title}` },
            { type: 10, content: `> Jogo iniciado por <@${user_id}>.` },
            { type: 14, divider: true, spacing: 1 },
            { type: 10, content: HANGMAN_STAGES[6 - lives] },
            { type: 10, content: `### Palavra Secreta:\n\`\`\`${displayWord}\`\`\`` },
            { type: 10, content: `**Vidas Restantes:** ${'❤️'.repeat(lives) || '💔'}` },
            { type: 14, divider: true, spacing: 2 },
            { type: 10, content: `### Histórico de Ações:\n${logText}` },
            { type: 14, divider: true, spacing: 2 },
            ...keyboardRows
        ]
    }];
};