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

const ALPHABET_HALF1 = 'ABCDEFGHIJKLM'.split('');
const ALPHABET_HALF2 = 'NOPQRSTUVWXYZ'.split('');

module.exports = function generateHangmanDashboardV2(gameData) {
    const { lives = 6, secret_word = '', guessed_letters = '', action_log = '', user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? ` ${letter} ` : ' __ '))
        .join('');

    const wrongLetters = guessed_letters.split('').filter(l => !secret_word.includes(l)).join(', ') || 'Nenhuma';
    const logText = action_log || '> O jogo começou! Boa sorte.';

    let title = "## 💀 Jogo da Forca";
    let statusText = `> Jogo iniciado por <@${user_id}>. Use os menus abaixo para adivinhar uma letra!`;

    if (status === 'won') {
        title = "## 🎉 Você Venceu! 🎉";
        statusText = `> Parabéns! A palavra era **${secret_word}**.`;
    } else if (status === 'lost' || status === 'given_up') {
        title = "## 💀 Fim de Jogo! 💀";
        statusText = `> A palavra secreta era **${secret_word}**.`;
    }

    const isGameActive = status === 'playing';

    // Cria as opções para o PRIMEIRO Select Menu (A-M)
    const options1 = ALPHABET_HALF1
        .filter(letter => !guessed_letters.includes(letter))
        .map(letter => ({ label: `Letra ${letter}`, value: letter }));

    const selectMenu1 = new StringSelectMenuBuilder()
        .setCustomId('hangman_guess_select_1') // ID único
        .setPlaceholder(isGameActive && options1.length > 0 ? 'Escolha uma letra (A-M)...' : 'Letras (A-M) esgotadas')
        .addOptions(options1.length > 0 ? options1 : [{ label: 'Nenhuma letra disponível', value: 'none' }])
        .setDisabled(!isGameActive || options1.length === 0);

    // Cria as opções para o SEGUNDO Select Menu (N-Z)
    const options2 = ALPHABET_HALF2
        .filter(letter => !guessed_letters.includes(letter))
        .map(letter => ({ label: `Letra ${letter}`, value: letter }));
        
    const selectMenu2 = new StringSelectMenuBuilder()
        .setCustomId('hangman_guess_select_2') // ID único
        .setPlaceholder(isGameActive && options2.length > 0 ? 'Escolha uma letra (N-Z)...' : 'Letras (N-Z) esgotadas')
        .addOptions(options2.length > 0 ? options2 : [{ label: 'Nenhuma letra disponível', value: 'none' }])
        .setDisabled(!isGameActive || options2.length === 0);


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
                    new ActionRowBuilder().addComponents(selectMenu1).toJSON(),
                    new ActionRowBuilder().addComponents(selectMenu2).toJSON()
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};