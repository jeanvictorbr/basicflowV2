// Substitua o conteúdo em: handlers/buttons/hangman_give_up.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_give_up',
    async execute(interaction) {
        await interaction.deferUpdate();

        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return interaction.message.edit({ content: 'Este Jogo da Forca já terminou.', components: [] });
        }

        const game = gameResult.rows[0];
        
        game.status = 'given_up';
        game.lives = 0;
        game.action_log += `\n> 🏳️ <@${interaction.user.id}> desistiu do jogo.`;
        
        await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);

        const finalDashboard = generateHangmanDashboard(game);
        
        await interaction.message.edit(finalDashboard);
    }
};