// Substitua o conteúdo em: handlers/buttons/hangman_give_up.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_give_up',
    async execute(interaction) {
        await interaction.deferUpdate();

        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return;
        }

        const game = gameResult.rows[0];
        
        game.status = 'given_up';
        game.lives = 0; // Zera as vidas para a arte correta aparecer
        game.action_log += `\n> 🏳️ <@${interaction.user.id}> desistiu do jogo.`;
        
        await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);

        const finalDashboard = generateHangmanDashboardV2(game);
        
        await interaction.editReply(finalDashboard);
    }
};