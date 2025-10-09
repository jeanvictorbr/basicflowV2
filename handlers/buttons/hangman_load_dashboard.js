// Substitua o conteúdo em: handlers/buttons/hangman_load_dashboard.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'hangman_load_dashboard',
    async execute(interaction) {
        // Busca os dados do jogo
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return interaction.update({ content: 'Este jogo da Forca expirou ou foi cancelado.', components: [] });
        }

        const game = gameResult.rows[0];
        game.status = 'playing';

        // Salva o ID da mensagem no banco
        await db.query('UPDATE hangman_games SET message_id = $1 WHERE channel_id = $2', [interaction.message.id, interaction.channel.id]);

        // Gera o dashboard V2
        const dashboard = generateHangmanDashboard(game);

        // ATENÇÃO: Esta é a correção crucial.
        // O interaction.update() substitui a mensagem inteira.
        // E ele espera que o componente V2 esteja dentro de um array.
        await interaction.update({
            content: '', // Limpa o conteúdo de texto antigo
            components: dashboard,
        });
    }
};