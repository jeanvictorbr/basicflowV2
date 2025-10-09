// Substitua o conteúdo em: handlers/selects/hangman_guess.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

// Função para avançar para o próximo turno
async function nextTurn(game, interaction) {
    const participants = game.participants.split(',').filter(Boolean);
    if (participants.length === 0) return game; // Ninguém para jogar

    const currentIndex = participants.indexOf(game.current_turn_user_id);
    const nextIndex = (currentIndex + 1) % participants.length;
    game.current_turn_user_id = participants[nextIndex];
    game.turn_started_at = new Date();
    game.action_log += `\n> ⌛ O tempo esgotou! A vez passou para <@${game.current_turn_user_id}>.`;

    await db.query(
        'UPDATE hangman_games SET current_turn_user_id = $1, turn_started_at = NOW(), action_log = $2 WHERE channel_id = $3',
        [game.current_turn_user_id, game.action_log, game.channel_id]
    );
    
    // Atualiza a interface para todos verem o novo turno
    const updatedDashboard = generateHangmanDashboardV2(game);
    await interaction.message.edit(updatedDashboard);
    
    return game;
}


module.exports = {
    customId: 'hangman_guess_select_', // Handler dinâmico
    async execute(interaction) {
        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) {
            await interaction.deferUpdate();
            return;
        }
        
        const game = gameResult.rows[0];

        // Verifica se é o turno do jogador
        if (interaction.user.id !== game.current_turn_user_id) {
            return interaction.reply({
                content: `Calma! Não é a sua vez. Aguarde o turno de <@${game.current_turn_user_id}>.`,
                ephemeral: true
            });
        }
        
        await interaction.deferUpdate();

        const guessedLetter = interaction.values[0];
        if (guessedLetter === 'none' || game.guessed_letters.includes(guessedLetter)) return;

        // Lógica da jogada
        game.guessed_letters += guessedLetter;
        const isCorrectGuess = game.secret_word.includes(guessedLetter);

        if (isCorrectGuess) {
            game.action_log += `\n> 👍 <@${interaction.user.id}> acertou a letra **${guessedLetter}**!`;
            // Se acertar, o jogador joga de novo, então resetamos o timer dele
            game.turn_started_at = new Date(); 
        } else {
            game.lives -= 1;
            game.action_log += `\n> 👎 <@${interaction.user.id}> errou a letra **${guessedLetter}**.`;
            // Se errar, passa o turno (a lógica de passar o turno acontecerá na próxima atualização)
        }

        // Verifica vitória ou derrota
        const allLettersGuessed = game.secret_word.split('').every(letter => game.guessed_letters.includes(letter) || letter === ' ');
        if (allLettersGuessed) {
            game.status = 'won';
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else if (game.lives <= 0) {
            game.status = 'lost';
            await db.query('DELETE FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        } else {
            // Se o jogo continua, atualiza o estado
            game.status = 'playing';
            
            // Se errou, passa o turno para o próximo
            if (!isCorrectGuess) {
                const participants = game.participants.split(',').filter(Boolean);
                const currentIndex = participants.indexOf(game.current_turn_user_id);
                const nextIndex = (currentIndex + 1) % participants.length;
                game.current_turn_user_id = participants[nextIndex];
            }
            game.turn_started_at = new Date(); // Reseta o timer para o próximo (ou o mesmo) jogador

            await db.query(
                'UPDATE hangman_games SET guessed_letters = $1, lives = $2, action_log = $3, current_turn_user_id = $4, turn_started_at = NOW() WHERE channel_id = $5',
                [game.guessed_letters, game.lives, game.action_log, game.current_turn_user_id, interaction.channel.id]
            );
        }

        const updatedDashboard = generateHangmanDashboardV2(game);
        await interaction.editReply(updatedDashboard);
    }
};