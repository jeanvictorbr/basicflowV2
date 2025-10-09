// Substitua o conteúdo em: ui/hangmanDashboard.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Arte ASCII para os estágios da forca
const HANGMAN_STAGES = [
    '\u200B', // Caractere invisível para o estado inicial
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```', // 6 vidas
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```', // 5 vidas
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```', // 4 vidas
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```', // 3 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```', // 2 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```', // 1 vida
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```'  // 0 vidas
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

module.exports = function generateHangmanDashboardV2(gameData) {
    const { lives = 6, secret_word = '', guessed_letters = '', action_log = '', user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? ` ${letter} ` : ' __ '))
        .join('');

    const wrongLetters = guessed_letters.split('').filter(l => !secret_word.includes(l)).join(', ') || 'Nenhuma';
    const logText = action_log || '> O jogo começou! Boa sorte.';
    
    let title = "## 💀 Jogo da Forca";
    let statusText = `> Jogo iniciado por <@${user_id}>. Use o menu abaixo para adivinhar uma letra!`;

    if (status === 'won') {
        title = "## 🎉 Você Venceu! 🎉";
        statusText = `> Parabéns! A palavra era **${secret_word}**.`;
    } else if (status === 'lost' || status === 'given_up') {
        title = "## 💀 Fim de Jogo! 💀";
        statusText = `> A palavra secreta era **${secret_word}**.`;
    }

    const isGameActive = status === 'playing';

    // Cria as opções para o Select Menu, mostrando apenas as letras ainda não adivinhadas
    const availableLetters = ALPHABET.filter(letter => !guessed_letters.includes(letter));
    const selectOptions = availableLetters.map(letter => ({
        label: `Letra ${letter}`,
        value: letter,
    }));

    const letterSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('hangman_guess_select')
        .setPlaceholder(isGameActive ? 'Escolha uma letra...' : 'O jogo terminou.')
        .addOptions(selectOptions.length > 0 ? selectOptions : [{ label: 'Fim de jogo', value: 'ended' }])
        .setDisabled(!isGameActive || selectOptions.length === 0);

    // Retorna a estrutura V2 completa e corrigida
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
                            style: 4,
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
                    // A única fileira de ação agora contém o Select Menu
                    new ActionRowBuilder().addComponents(letterSelectMenu).toJSON()
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};