// Crie este arquivo em: handlers/buttons/hangman_join.js
const db = require('../../database.js');
const generateHangmanDashboardV2 = require('../../ui/hangmanDashboard.js');

module.exports = {
    customId: 'hangman_join',
    async execute(interaction) {
        await interaction.deferUpdate();

        const gameResult = await db.query('SELECT * FROM hangman_games WHERE channel_id = $1', [interaction.channel.id]);
        if (gameResult.rows.length === 0) return;

        const game = gameResult.rows[0];
        let participants = game.participants ? game.participants.split(',') : [];

        if (participants.includes(interaction.user.id)) {
            await interaction.followUp({ content: 'Você já está participando deste jogo!', ephemeral: true });
            return;
        }

        participants.push(interaction.user.id);
        game.participants = participants.join(',');
        game.action_log += `\n> 👋 <@${interaction.user.id}> entrou no jogo!`;

        await db.query(
            'UPDATE hangman_games SET participants = $1, action_log = $2 WHERE channel_id = $3',
            [game.participants, game.action_log, interaction.channel.id]
        );

        const updatedDashboard = generateHangmanDashboardV2(game);
        await interaction.editReply(updatedDashboard);
    }
};