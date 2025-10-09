// Substitua o conteúdo em: handlers/buttons/hangman_load_dashboard.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_load_dashboard',
    async execute(interaction) {
        // Agora o defer é update, pois estamos atualizando uma mensagem existente
        await interaction.deferUpdate();

        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            // Se o jogo não for encontrado, edita a mensagem do botão para informar o fim.
            return interaction.editReply({ content: 'Este Jogo da Forca expirou ou foi cancelado.', components: [] });
        }

        const game = gameResult.rows[0];
        game.status = 'playing';

        // Atualiza o status no DB para "playing" e salva o ID da mensagem do jogo
        await db.query('UPDATE hangman_games SET status = $1, message_id = $2 WHERE channel_id = $3', ['playing', interaction.message.id, interaction.channel.id]);

        const dashboardPayload = generateHangmanDashboardV2(game);

        // Usa editReply para substituir a mensagem do botão pelo painel V2
        await interaction.editReply(dashboardPayload);
    }
};