// Substitua o conteúdo em: ui/hangmanDashboard.js
const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

const HANGMAN_STAGES = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```'
];

const ALPHABET_HALF1 = 'ABCDEFGHIJKLM'.split('');
const ALPHABET_HALF2 = 'NOPQRSTUVWXYZ'.split('');

module.exports = function generateHangmanDashboardV2(gameData) {
    const { lives = 6, secret_word = '', guessed_letters = '', action_log = '', user_id, status, participants = '', current_turn_user_id, turn_started_at } = gameData;

    const displayWord = secret_word.split('').map(letter => (guessed_letters.includes(letter) || letter === ' ' ? ` ${letter} ` : ' __ ')).join('');
    const wrongLetters = guessed_letters.split('').filter(l => !secret_word.includes(l) && l !== ' ').join(', ') || 'Nenhuma';
    const logText = action_log || '> O jogo começou! Boa sorte.';
    const isGameActive = status === 'playing';

    let title = "## 💀 Jogo da Forca";
    let statusText = `> Jogo iniciado por <@${user_id}>.`;
    let color = 3447003;
    if (lives <= 3) color = 16705372;
    if (lives <= 1) color = 15158332;

    if (status === 'won') {
        title = "## 🎉 Vitória! 🎉";
        statusText = `> Parabéns! A palavra era **${secret_word}**.`;
        color = 3066993;
    } else if (status === 'lost' || status === 'given_up') {
        title = "## ☠️ Fim de Jogo! 💀";
        statusText = `> A palavra secreta era **${secret_word}**.`;
        color = 10038562;
    }

    const participantsArray = participants.split(',').filter(Boolean);
    const participantsList = participantsArray.map(pId => `<@${pId}>`).join(' ');
    let turnInfo = `> **Jogadores:** ${participantsList || 'Clique em "Participar" para entrar!'}`;

    if (isGameActive && current_turn_user_id) {
        const turnEndTime = Math.floor((new Date(turn_started_at).getTime() + 30000) / 1000); // 30 segundos
        turnInfo += `\n> \n> 👑 **É a vez de:** <@${current_turn_user_id}> (expira <t:${turnEndTime}:R>)`;
    }

    const options1 = ALPHABET_HALF1.map(letter => ({ label: `Letra ${letter}`, value: letter }));
    const selectMenu1 = new StringSelectMenuBuilder()
        .setCustomId('hangman_guess_select_1')
        .setPlaceholder(isGameActive ? 'Escolha uma letra (A-M)...' : 'Jogo encerrado')
        .addOptions(options1)
        .setDisabled(!isGameActive);

    const options2 = ALPHABET_HALF2.map(letter => ({ label: `Letra ${letter}`, value: letter }));
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
                        accessory: { type: 2, style: 4, label: "Desistir", emoji: { name: "🏳️" }, custom_id: "hangman_give_up", disabled: !isGameActive },
                        components: [ { type: 10, content: HANGMAN_STAGES[6 - lives] || HANGMAN_STAGES[6] } ]
                    },
                    { type: 10, content: `### ${displayWord}` },
                    { type: 10, content: `> ❤️ **Vidas:** ${lives}/6 | 👎 **Letras Erradas:** ${wrongLetters}` },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: "### Painel da Partida" },
                    { type: 10, content: turnInfo },
                    { type: 10, content: logText },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 1, components: [
                        { type: 2, style: 3, label: "Participar", emoji: { name: "👋" }, custom_id: "hangman_join", disabled: !isGameActive },
                        // NOVO BOTÃO AQUI
                        { type: 2, style: 1, label: "Adivinhar Palavra", emoji: { name: "🎯" }, custom_id: "hangman_guess_word", disabled: !isGameActive }
                    ]},
                    new ActionRowBuilder().addComponents(selectMenu1).toJSON(),
                    new ActionRowBuilder().addComponents(selectMenu2).toJSON()
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};