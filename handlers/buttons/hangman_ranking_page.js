// Crie este arquivo em: handlers/buttons/hangman_ranking_page.js
const db = require('../../database.js');
const generateHangmanRanking = require('../../ui/hangmanRanking.js');

module.exports = {
    customId: 'hangman_ranking_page_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        const rankingData = (await db.query(
            'SELECT * FROM hangman_ranking WHERE guild_id = $1 ORDER BY points DESC',
            [interaction.guild.id]
        )).rows;

        const rankingPayload = generateHangmanRanking(rankingData, page);
        await interaction.editReply(rankingPayload);
    }
};