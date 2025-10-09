// Substitua o conteúdo em: handlers/selects/hangman_guess.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_guess_select_',
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
        
        if (interaction.user.id !== game.current_turn_user_id) {
            return interaction.reply({
                content: `Calma! Não é a sua vez. Aguarde o turno de <@${game.current_turn_user_id}>.`,
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
            game.turn_started_at = new Date(); 
        } else {
            game.lives -= 1;
            game.action_log += `\n> 👎 <@${interaction.user.id}> errou a letra **${guessedLetter}**.`;
        }

        const allLettersGuessed = game.secret_word.split('').every(letter => game.guessed_letters.includes(letter) || letter === ' ');
        if (allLettersGuessed) {
            game.status = 'won';
            game.winnerId = interaction.user.id; // SALVA O ID DO VENCEDOR
            game.action_log += `\n> 🏆 <@${interaction.user.id}> acertou a última letra e venceu o jogo!`;
            
            await db.query(
                `INSERT INTO hangman_ranking (guild_id, user_id, points) VALUES ($1, $2, 1)
                 ON CONFLICT (guild_id, user_id) DO UPDATE SET points = hangman_ranking.points + 1`,
                [interaction.guild.id, interaction.user.id]
            );
            
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else if (game.lives <= 0) {
            game.status = 'lost';
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else {
            game.status = 'playing';
            
            if (!isCorrectGuess) {
                const currentIndex = participants.indexOf(game.current_turn_user_id);
                const nextIndex = (currentIndex + 1) % participants.length;
                game.current_turn_user_id = participants[nextIndex];
            }
            game.turn_started_at = new Date();

            await db.query(
                'UPDATE hangman_games SET guessed_letters = $1, lives = $2, action_log = $3, current_turn_user_id = $4, turn_started_at = NOW() WHERE channel_id = $5',
                [game.guessed_letters, game.lives, game.action_log, game.current_turn_user_id, interaction.channel.id]
            );
        }

        const updatedDashboard = generateHangmanDashboardV2(game);
        await interaction.editReply(updatedDashboard);
    }
};