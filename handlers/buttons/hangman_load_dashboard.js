// Crie em: handlers/buttons/hangman_load_dashboard.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'hangman_load_dashboard',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Busca os dados do jogo que salvamos na etapa anterior
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return interaction.editReply({ content: 'Este jogo da Forca não foi encontrado ou já terminou.', components: [] });
        }

        const game = gameResult.rows[0];
        game.status = 'playing'; // Define o status para o jogo em andamento

        // Salva o ID da mensagem no banco para futuras atualizações
        await db.query('UPDATE hangman_games SET message_id = $1 WHERE channel_id = $2', [interaction.message.id, interaction.channel.id]);

        // Gera o dashboard V2
        const dashboard = generateHangmanDashboard(game);

        // Substitui a mensagem do botão pelo dashboard V2, usando a flag correta
        await interaction.message.edit({
            content: null,
            components: dashboard,
            flags: V2_FLAG
        });
    }
};