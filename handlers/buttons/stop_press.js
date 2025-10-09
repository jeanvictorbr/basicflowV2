// Substitua o conteúdo em: handlers/buttons/stop_press.js
const db = require('../../database.js');
const generateStopVoting = require('../../ui/stopVotingDashboard.js');

module.exports = {
    customId: 'stop_press',
    async execute(interaction) {
        await interaction.deferUpdate();

        const game = (await db.query('SELECT * FROM stop_games WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (!game || game.status !== 'playing') return;

        const userSubmissions = (await db.query(
            'SELECT COUNT(*) FROM stop_submissions WHERE game_message_id = $1 AND user_id = $2',
            [game.message_id, interaction.user.id]
        )).rows[0].count;

        if (userSubmissions < game.categories.split(',').length) {
            return interaction.followUp({ content: '❌ Você só pode apertar STOP! depois de preencher todas as categorias!', ephemeral: true });
        }

        await db.query(
            'UPDATE stop_games SET status = $1, stopper_id = $2 WHERE message_id = $3',
            ['voting', interaction.user.id, interaction.message.id]
        );
        
        const updatedGame = { ...game, status: 'voting', stopper_id: interaction.user.id };
        const submissions = (await db.query('SELECT * FROM stop_submissions WHERE game_message_id = $1 ORDER BY category, user_id', [interaction.message.id])).rows;

        await interaction.editReply(generateStopVoting(updatedGame, submissions));
    }
};