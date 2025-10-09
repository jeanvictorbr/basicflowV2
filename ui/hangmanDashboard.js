// Substitua o conteúdo em: ui/hangmanDashboard.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

const HANGMAN_STAGES = [
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
    const { lives = 6, secret_word = '', guessed_letters = '', action_log = '', user_id, status, participants = '', current_turn_user_id, turn_started_at } = gameData;

    // CORREÇÃO: Garante que o display da palavra tenha o tamanho correto
    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) || letter === ' ' ? ` ${letter} ` : ' __ '))
        .join('');

    const wrongLetters = guessed_letters.split('').filter(l => !secret_word.includes(l) && l !== ' ').join(', ') || 'Nenhuma';
    const logText = action_log || '> O jogo começou! Boa sorte.';
    const isGameActive = status === 'playing';

    // Lógica de Título, Status e Cor
    let title = "## 💀 Jogo da Forca";
    let statusText = `> Jogo iniciado por <@${user_id}>.`;
    let color = 3447003; // Azul
    if (lives <= 3) color = 16705372; // Amarelo
    if (lives <= 1) color = 15158332; // Vermelho

    if (status === 'won') {
        title = "## 🎉 Vitória! 🎉";
        statusText = `> Parabéns aos jogadores! A palavra era **${secret_word}**.`;
        color = 3066993; // Verde
    } else if (status === 'lost' || status === 'given_up') {
        title = "## ☠️ Fim de Jogo! 💀";
        statusText = `> A palavra secreta era **${secret_word}**.`;
        color = 10038562; // Cinza escuro
    }

    // Lógica de Turnos e Timer
    const participantsArray = participants.split(',').filter(Boolean);
    const participantsList = participantsArray.map(pId => `<@${pId}>`).join(' ');
    let turnInfo = `> **Jogadores:** ${participantsList || 'Nenhum jogador participando.'}`;

    if (isGameActive && current_turn_user_id) {
        const turnEndTime = Math.floor((new Date(turn_started_at).getTime() + 20000) / 1000);
        turnInfo += `\n> \n> 👑 **É a vez de:** <@${current_turn_user_id}>`
        turnInfo += `\n> ⏳ **Tempo:** Termina <t:${turnEndTime}:R>`;
    }

    // Menus de Seleção
    const options1 = ALPHABET_HALF1.map(letter => ({ label: `Letra ${letter}`, value: letter, disabled: guessed_letters.includes(letter) }));
    const selectMenu1 = new StringSelectMenuBuilder()
        .setCustomId('hangman_guess_select_1')
        .setPlaceholder(isGameActive ? 'Escolha uma letra (A-M)...' : 'Jogo encerrado')
        .addOptions(options1)
        .setDisabled(!isGameActive);

    const options2 = ALPHABET_HALF2.map(letter => ({ label: `Letra ${letter}`, value: letter, disabled: guessed_letters.includes(letter) }));
    const selectMenu2 = new StringSelectMenuBuilder()
        .setCustomId('hangman_guess_select_2')
        .setPlaceholder(isGameActive ? 'Escolha uma letra (N-Z)...' : 'Jogo encerrado')
        .addOptions(options2)
        .setDisabled(!isGameActive);

    return {
        components: [
            {
                type: 17, accent_color: color,
                components: [
                    { type: 10, content: title },
                    { type: 10, content: statusText },
                    { type: 14, divider: true, spacing: 1 },
                    {
                        type: 9,
                        components: [
                            { type: 10, content: HANGMAN_STAGES[6 - lives] || HANGMAN_STAGES[6] },
                            { type: 10, content: `### ${displayWord}` },
                            { type: 10, content: `> ❤️ **Vidas:** ${lives}/6 | 👎 **Letras Erradas:** ${wrongLetters}` },
                        ]
                    },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: "### Painel da Partida" },
                    { type: 10, content: turnInfo },
                    { type: 10, content: logText },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 1, components: [
                        { type: 2, style: 3, label: "Participar", emoji: { name: "👋" }, custom_id: "hangman_join", disabled: !isGameActive },
                        { type: 2, style: 4, label: "Desistir", emoji: { name: "🏳️" }, custom_id: "hangman_give_up", disabled: !isGameActive }
                    ]},
                    new ActionRowBuilder().addComponents(selectMenu1).toJSON(),
                    new ActionRowBuilder().addComponents(selectMenu2).toJSON()
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};