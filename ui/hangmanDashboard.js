// Substitua o conteúdo em: ui/hangmanDashboard.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Arte ASCII para os estágios da forca, agora dentro do embed
const HANGMAN_STAGES = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```', // 6 vidas
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```', // 5 vidas
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```', // 4 vidas
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```', // 3 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```', // 2 vidas
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```', // 1 vida
    '```\n +---+\n |   |\n O   |\n/ \\  |\n     |\n=========\n```'  // 0 vidas
];

const ALPHABET_ROWS = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY', 'Z'];

module.exports = function generateHangmanDashboard(gameData) {
    const { lives = 6, secret_word = '', guessed_letters = '', action_log = '', user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? letter : '_'))
        .join(' ');

    const logText = action_log || '> O jogo começou! Boa sorte.';

    let color = 3447003; // Azul
    let title = "Jogo da Forca";
    let description = `Jogo iniciado por <@${user_id}>. Use os botões abaixo para adivinhar a palavra!`;
    if (status === 'won') {
        color = 3066993; // Verde
        title = "🎉 Você Venceu! 🎉";
        description = `Parabéns! A palavra era **${secret_word}**.`;
    } else if (status === 'lost' || status === 'given_up') {
        color = 15158332; // Vermelho
        title = "💀 Fim de Jogo! 💀";
        description = `A palavra secreta era **${secret_word}**.`;
    }

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(description)
        .addFields(
            { name: 'Palavra Secreta', value: `\`\`\`${displayWord}\`\`\`` },
            { name: 'Vidas', value: `${'❤️'.repeat(lives) || '💔'} (${lives}/6)`, inline: true },
            { name: 'Letras Erradas', value: `\`${guessed_letters.split('').filter(l => !secret_word.includes(l)).join(', ') || 'Nenhuma'}\``, inline: true },
            { name: 'Histórico', value: logText },
            { name: 'Arte', value: HANGMAN_STAGES[6 - lives] }
        );

    const guessed = guessed_letters.split('');
    const components = ALPHABET_ROWS.map(rowString => {
        const row = new ActionRowBuilder();
        rowString.split('').forEach(letter => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`hangman_guess_${letter}`)
                    .setLabel(letter)
                    .setStyle(guessed.includes(letter) ? ButtonStyle.Secondary : ButtonStyle.Primary)
                    .setDisabled(guessed.includes(letter) || status !== 'playing')
            );
        });
        return row;
    });

    components.push(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('hangman_give_up')
                .setLabel("Desistir")
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🏳️')
                .setDisabled(status !== 'playing')
        )
    );

    return { embeds: [embed], components };
};