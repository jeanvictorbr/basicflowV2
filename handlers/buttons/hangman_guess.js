// Substitua o conteúdo em: handlers/buttons/hangman_guess.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'hangman_guess_',
    async execute(interaction) {
        await interaction.deferUpdate();

        const guessedLetter = interaction.customId.split('_')[2];

        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) { return; }

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
            game.action_log += `\n> 🏆 **VITÓRIA!** A palavra era **${game.secret_word}**.`;
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else if (game.lives <= 0) {
            game.status = 'lost';
            game.action_log += `\n> ☠️ **FIM DE JOGO!** A palavra era **${game.secret_word}**.`;
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else {
            game.status = 'playing';
            await db.query(
                'UPDATE hangman_games SET guessed_letters = $1, lives = $2, action_log = $3 WHERE channel_id = $4',
                [game.guessed_letters, game.lives, game.action_log, interaction.channel.id]
            );
        }

        const updatedDashboard = generateHangmanDashboard(game);
        
        // CORREÇÃO DEFINITIVA: Adicionando a V2_FLAG ao editar a mensagem
        await interaction.message.edit({
            components: updatedDashboard,
            flags: V2_FLAG
        });
    }
};