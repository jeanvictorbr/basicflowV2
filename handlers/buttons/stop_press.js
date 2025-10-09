// Crie este arquivo em: handlers/buttons/stop_press.js
const db = require('../../database.js');
const generateStopResults = require('../../ui/stopResultsDashboard.js');

module.exports = {
    customId: 'stop_press',
    async execute(interaction) {
        await interaction.deferUpdate();

        const game = (await db.query('SELECT * FROM stop_games WHERE message_id = $1', [interaction.message.id])).rows[0];
        if (!game || game.status !== 'playing') return;

        await db.query(
            'UPDATE stop_games SET status = $1, stopper_id = $2 WHERE message_id = $3',
            ['finished', interaction.user.id, interaction.message.id]
        );
        
        const updatedGame = { ...game, status: 'finished', stopper_id: interaction.user.id };
        const submissions = (await db.query('SELECT * FROM stop_submissions WHERE game_message_id = $1', [interaction.message.id])).rows;

        await interaction.editReply(generateStopResults(updatedGame, submissions));
    }
};