// Crie este arquivo em: handlers/commands/ranking.js
const db = require('../../database.js');
const generateHangmanRanking = require('../../ui/hangmanRanking.js');

module.exports = {
    customId: 'ranking',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const rankingData = (await db.query(
            'SELECT * FROM hangman_ranking WHERE guild_id = $1 ORDER BY points DESC',
            [interaction.guild.id]
        )).rows;

        const rankingPayload = generateHangmanRanking(rankingData, 0);
        await interaction.editReply(rankingPayload);
    }
};