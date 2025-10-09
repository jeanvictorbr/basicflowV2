// Crie em: handlers/buttons/hangman_guess.js
const db = require('../../database.js');
const generateHangmanDashboard = require('../../ui/hangmanDashboard.js');

const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'hangman_guess_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();

        const guessedLetter = interaction.customId.split('_')[2];

        // 1. Busca os dados do jogo atual no banco de dados
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            return interaction.followUp({ content: 'O Jogo da Forca neste canal já terminou.', ephemeral: true });
        }

        const game = gameResult.rows[0];

        // Segurança extra para evitar duplicação de cliques
        if (game.guessed_letters.includes(guessedLetter)) {
            return;
        }

        // 2. Atualiza o estado do jogo
        game.guessed_letters += guessedLetter;
        const isCorrectGuess = game.secret_word.includes(guessedLetter);

        let logMessage;
        if (isCorrectGuess) {
            logMessage = `\n> 👍 <@${interaction.user.id}> acertou a letra **${guessedLetter}**!`;
        } else {
            game.lives -= 1;
            logMessage = `\n> 👎 <@${interaction.user.id}> errou a letra **${guessedLetter}**.`;
        }
        game.action_log += logMessage;

        // 3. Verifica a condição de vitória ou derrota
        const allLettersGuessed = game.secret_word.split('').every(letter => game.guessed_letters.includes(letter));

        if (allLettersGuessed) {
            game.status = 'won';
            game.action_log += `\n> 🏆 **VITÓRIA!** A palavra era **${game.secret_word}**.`;
            // Limpa o jogo do banco de dados para permitir um novo
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else if (game.lives <= 0) {
            game.status = 'lost';
            game.action_log += `\n> ☠️ **FIM DE JOGO!** A palavra era **${game.secret_word}**.`;
            // Limpa o jogo do banco de dados para permitir um novo
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else {
            // Se o jogo continua, apenas atualiza o estado no banco
            await db.query(
                'UPDATE hangman_games SET guessed_letters = $1, lives = $2, action_log = $3 WHERE channel_id = $4',
                [game.guessed_letters, game.lives, game.action_log, interaction.channel.id]
            );
        }

        // 4. Redesenha e atualiza o dashboard do jogo
        const updatedDashboard = generateHangmanDashboard(game);
        await interaction.message.edit({
            components: updatedDashboard,
            flags: V2_FLAG
        });
    }
};