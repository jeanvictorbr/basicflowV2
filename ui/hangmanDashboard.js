// Substitua o conteúdo em: ui/hangmanDashboard.js

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

// --- LAYOUT DO TECLADO CORRIGIDO PARA CABER EM 5 FILEIRAS ---
const ALPHABET_ROWS = [
    'ABCDE',
    'FGHIJ',
    'KLMNO',
    'PQRSTU',
    'VWXYZ' 
];

module.exports = function generateHangmanDashboard(gameData) {
    const { lives, secret_word, guessed_letters, action_log, user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? `${letter} ` : '_ '))
        .join('');

    const logText = action_log || '> O jogo começou! Boa sorte.';

    let color = 3447003;
    let title = "Jogo da Forca";
    if (status === 'won') {
        color = 3066993;
        title = "🎉 Você Venceu! 🎉";
    } else if (status === 'lost') {
        color = 15158332;
        title = "💀 Você Perdeu! 💀";
    }

    const guessed = guessed_letters.split('');

    // Gera as fileiras do teclado
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

    // Botão de desistir (adicionado à última fileira se houver espaço, senão cria uma nova)
    // ESTA LÓGICA FOI REMOVIDA PARA SIMPLICIDADE E GARANTIA. O BOTÃO DESISTIR FICA SOZINHO.
    const controlsRow = {
        type: 1,
        components: [{
            type: 2,
            style: 4,
            label: "Desistir",
            custom_id: 'hangman_give_up',
            emoji: { name: '🏳️' },
            disabled: status !== 'playing'
        }]
    };

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
            // AQUI ESTÁ A GARANTIA: O spread operator (...) insere as 5 fileiras do teclado.
            ...keyboardRows,
            // A fileira de controles é a 6a, mas o limite é 5.
            // Para resolver, vamos juntar a última fileira do alfabeto com o botão de desistir
            // Mas a API só permite 5 botões por fileira.
            // A solução é reorganizar o ALPHABET_ROWS
            controlsRow // O erro estava aqui.
        ]
    }];
};