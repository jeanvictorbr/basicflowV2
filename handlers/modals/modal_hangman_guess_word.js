// Crie este arquivo em: handlers/modals/modal_hangman_guess_word.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'modal_hangman_guess_word',
    async execute(interaction) {
        await interaction.deferUpdate();
        const guessedWord = interaction.fields.getTextInputValue('input_word_guess').toUpperCase();
        const game = (await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id])).rows[0];

        if (guessedWord === game.secret_word) {
            game.status = 'won';
            game.action_log += `\n> 🏆 <@${interaction.user.id}> adivinhou a palavra **${game.secret_word}** e venceu o jogo!`;
            
            // Adiciona pontos ao vencedor
            await db.query(
                `INSERT INTO hangman_ranking (guild_id, user_id, points) VALUES ($1, $2, 1)
                 ON CONFLICT (guild_id, user_id) DO UPDATE SET points = hangman_ranking.points + 1`,
                [interaction.guild.id, interaction.user.id]
            );

            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else {
            game.action_log += `\n> ❌ <@${interaction.user.id}> errou a palavra! Ele ficará uma rodada sem jogar.`;
            game.skipped_turn_user_id = interaction.user.id; // Marca o usuário para pular a vez
            
            // Lógica para passar o turno
            const participants = game.participants.split(',').filter(Boolean);
            const currentIndex = participants.indexOf(game.current_turn_user_id);
            const nextIndex = (currentIndex + 1) % participants.length;
            game.current_turn_user_id = participants[nextIndex];
            game.turn_started_at = new Date();

            await db.query(
                'UPDATE hangman_games SET action_log = $1, skipped_turn_user_id = $2, current_turn_user_id = $3, turn_started_at = NOW() WHERE channel_id = $4',
                [game.action_log, game.skipped_turn_user_id, game.current_turn_user_id, interaction.channel.id]
            );
        }

        const updatedDashboard = generateHangmanDashboardV2(game);
        await interaction.editReply(updatedDashboard);
    }
};