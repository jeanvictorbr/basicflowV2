// Substitua o conteúdo em: handlers/buttons/hangman_load_dashboard.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_load_dashboard',
    async execute(interaction) {
        // Não é necessário deferUpdate() aqui, pois o update é a resposta
        
        // Busca os dados do jogo que salvamos na etapa anterior
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            // Se o jogo foi deletado, apenas remove o botão
            return interaction.update({ content: 'Este jogo da Forca expirou ou foi cancelado.', components: [] });
        }

        const game = gameResult.rows[0];
        game.status = 'playing'; // Define o status para o jogo em andamento

        // Salva o ID da mensagem no banco para futuras atualizações
        await db.query('UPDATE hangman_games SET message_id = $1 WHERE channel_id = $2', [interaction.message.id, interaction.channel.id]);

        // Gera o dashboard V2
        const dashboard = generateHangmanDashboard(game);

        // Substitui a mensagem do botão pelo dashboard V2
        // A flag V2_FLAG foi REMOVIDA daqui, pois o interaction.update() já entende o formato
        await interaction.update({
            content: null,
            components: dashboard,
        });
    }
};