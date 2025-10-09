// Substitua o conteúdo em: handlers/buttons/hangman_give_up.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_give_up',
    async execute(interaction) {
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            await interaction.deferUpdate();
            return;
        }
        
        const game = gameResult.rows[0];
        const participants = game.participants.split(',');
        
        // Apenas quem iniciou ou quem está participando pode desistir
        if (interaction.user.id !== game.user_id && !participants.includes(interaction.user.id)) {
             return interaction.reply({
                content: '❌ Apenas quem iniciou o jogo ou está participando pode desistir.',
                ephemeral: true
            });
        }

        await interaction.deferUpdate();
        
        game.status = 'given_up';
        game.lives = 0;
        game.action_log += `\n> 🏳️ <@${interaction.user.id}> desistiu do jogo.`;
        
        await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);

        const finalDashboard = generateHangmanDashboardV2(game);
        
        await interaction.editReply(finalDashboard);
    }
};