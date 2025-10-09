// Crie em: ui/hangmanDashboard.js

// Arte ASCII para os estágios da forca
const HANGMAN_STAGES = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```', // 6 vidas
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```', // 5 vidas
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```', // 4 vidas
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```', // 3 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```', // 2 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```', // 1 vida
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```'  // 0 vidas
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

module.exports = function generateHangmanDashboard(gameData) {
    const { lives, secret_word, guessed_letters, action_log, user_id, status } = gameData;

    // Constrói a palavra a ser exibida (Ex: F _ _ E _ _ L)
    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? `${letter} ` : '_ '))
        .join('');

    // Constrói o texto do histórico
    const logText = action_log || '> O jogo começou! Boa sorte.';

    // Define a cor e o título com base no status do jogo
    let color = 3447003; // Azul padrão
    let title = "Jogo da Forca";
    if (status === 'won') {
        color = 3066993; // Verde
        title = "🎉 Você Venceu! 🎉";
    } else if (status === 'lost') {
        color = 15158332; // Vermelho
        title = "💀 Você Perdeu! 💀";
    }

    // Gera as linhas de botões do teclado
    const keyboardRows = [];
    const guessed = guessed_letters.split('');
    const chunkSize = 7;
    for (let i = 0; i < ALPHABET.length; i += chunkSize) {
        const chunk = ALPHABET.slice(i, i + chunkSize);
        const row = { type: 1, components: [] };
        chunk.forEach(letter => {
            row.components.push({
                type: 2,
                style: guessed.includes(letter) ? 2 : 1, // Cinza se já foi chutada, Azul se não
                label: letter,
                custom_id: `hangman_guess_${letter}`,
                disabled: guessed.includes(letter) || status !== 'playing'
            });
        });
        keyboardRows.push(row);
    }
    
    // Adiciona o botão de desistir
    keyboardRows.push({
        type: 1,
        components: [{
            type: 2,
            style: 4, // Vermelho
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
            {
                type: 9,
                components: [
                    { type: 10, content: `## ${title}` },
                    { type: 10, content: `> Jogo iniciado por <@${user_id}>.` }
                ]
            },
            { type: 14, divider: true, spacing: 1 },
            {
                type: 9,
                accessory: { type: 10, content: HANGMAN_STAGES[6 - lives] }, // Arte da Forca
                components: [
                    { type: 10, content: `### Palavra Secreta:` },
                    { type: 10, content: `\`\`\`${displayWord}\`\`\`` },
                    { type: 10, content: `**Vidas Restantes:** ${'❤️'.repeat(lives) || '💔'}` }
                ]
            },
            { type: 14, divider: true, spacing: 2 },
            {
                type: 10,
                content: `### Histórico de Ações:\n${logText}`
            },
            { type: 14, divider: true, spacing: 2 },
            ...keyboardRows
        ]
    }];
};