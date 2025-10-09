// Crie este arquivo em: handlers/buttons/stop_show_ranking.js
const db = require('../../database.js');
const generateStopRanking = require('../../ui/stopRanking.js');

module.exports = {
    customId: 'stop_show_ranking',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const rankingData = (await db.query(
            'SELECT * FROM stop_ranking WHERE guild_id = $1 ORDER BY points DESC',
            [interaction.guild.id]
        )).rows;

        const rankingPayload = generateStopRanking(rankingData, 0);
        await interaction.editReply(rankingPayload);
    }
};