// Substitua o conteúdo em: handlers/buttons/hangman_load_dashboard.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_load_dashboard',
    async execute(interaction) {
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return interaction.update({ content: 'Este jogo da Forca expirou ou foi cancelado.', components: [] });
        }

        const game = gameResult.rows[0];
        game.status = 'playing';

        await db.query('UPDATE hangman_games SET message_id = $1 WHERE channel_id = $2', [interaction.message.id, interaction.channel.id]);

        const dashboardPayload = generateHangmanDashboard(game);

        await interaction.update({
            content: '',
            ...dashboardPayload // Envia embeds e components gerados pela UI
        });
    }
};