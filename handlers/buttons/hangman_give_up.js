// Crie em: handlers/buttons/hangman_give_up.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'hangman_give_up',
    async execute(interaction) {
        await interaction.deferUpdate();

        // 1. Busca os dados do jogo
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return interaction.followUp({ content: 'O Jogo da Forca neste canal já terminou.', ephemeral: true });
        }

        const game = gameResult.rows[0];

        // 2. Atualiza o status do jogo para "derrota"
        game.status = 'lost';
        game.lives = 0; // Zera as vidas visualmente
        game.action_log += `\n> 🏳️ <@${interaction.user.id}> desistiu do jogo. A palavra era **${game.secret_word}**.`;
        
        // 3. Limpa o registro do jogo do banco de dados
        await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);

        // 4. Redesenha o dashboard final e atualiza a mensagem
        const finalDashboard = generateHangmanDashboard(game);
        await interaction.message.edit({
            components: finalDashboard,
            flags: V2_FLAG
        });
    }
};