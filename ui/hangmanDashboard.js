// Substitua o conteúdo em: ui/hangmanDashboard.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const HANGMAN_STAGES = [
    '```\n +---+\n |   |\n     |\n     |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n     |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n |   |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|   |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n     |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/    |\n     |\n=========\n```',
    '```\n +---+\n |   |\n O   |\n/|\\  |\n/ \\  |\n     |\n=========\n```'
];

const ALPHABET_ROWS = ['ABCDE', 'FGHIJ', 'KLMNO', 'PQRST', 'UVWXY', 'Z'];

module.exports = function generateHangmanDashboard(gameData) {
    const { lives = 6, secret_word = 'ERRO', guessed_letters = '', action_log = '', user_id, status } = gameData;

    const displayWord = secret_word
        .split('')
        .map(letter => (guessed_letters.includes(letter) ? letter : '_'))
        .join(' ');

    let color = 3447003; // Azul
    let title = "Jogo da Forca Interativo";
    let description = `Jogo iniciado por <@${user_id}>. Use o teclado abaixo para adivinhar!`;

    if (status === 'won') {
        color = 3066993; // Verde
        title = "🎉 Parabéns, você venceu! 🎉";
        description = `A palavra era **${secret_word}**.`;
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
            { name: 'Palavra', value: `\`\`\`${displayWord}\`\`\`` },
            { name: 'Vidas', value: `${'❤️'.repeat(lives) || '💔'} (${lives}/6)`, inline: true },
            { name: 'Letras Erradas', value: `\`${guessed_letters.split('').filter(l => !secret_word.includes(l)).join(', ') || 'Nenhuma'}\``, inline: true },
            { name: 'Histórico de Ações', value: action_log },
            { name: 'Forca', value: HANGMAN_STAGES[6 - lives] }
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