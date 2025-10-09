// Substitua o conteúdo em: handlers/selects/hangman_guess.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_guess_select_', // Handler dinâmico
    async execute(interaction) {
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            await interaction.deferUpdate();
            return;
        }
        
        const game = gameResult.rows[0];
        const participants = game.participants.split(',');

        if (!participants.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Você precisa entrar no jogo para adivinhar letras! Clique em "Participar".',
                ephemeral: true
            });
        }
        
        await interaction.deferUpdate();

        const guessedLetter = interaction.values[0];
        if (guessedLetter === 'none' || game.guessed_letters.includes(guessedLetter)) return;

        game.guessed_letters += guessedLetter;
        const isCorrectGuess = game.secret_word.includes(guessedLetter);

        if (isCorrectGuess) {
            game.action_log += `\n> 👍 <@${interaction.user.id}> acertou a letra **${guessedLetter}**!`;
        } else {
            game.lives -= 1;
            game.action_log += `\n> 👎 <@${interaction.user.id}> errou a letra **${guessedLetter}**.`;
        }

        const allLettersGuessed = game.secret_word.split('').every(letter => game.guessed_letters.includes(letter));

        if (allLettersGuessed) {
            game.status = 'won';
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else if (game.lives <= 0) {
            game.status = 'lost';
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else {
            game.status = 'playing';
            await db.query(
                'UPDATE hangman_games SET guessed_letters = $1, lives = $2, action_log = $3 WHERE channel_id = $4',
                [game.guessed_letters, game.lives, game.action_log, interaction.channel.id]
            );
        }

        const updatedDashboard = generateHangmanDashboardV2(game);
        await interaction.editReply(updatedDashboard);
    }
};