// Substitua o conteúdo em: handlers/selects/hangman_guess.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_guess_select_', // Agora é um handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        const guessedLetter = interaction.values[0];
        if (guessedLetter === 'none' || guessedLetter === 'ended') return;

        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return;
        }

        const game = gameResult.rows[0];
        if (game.guessed_letters.includes(guessedLetter)) return;

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