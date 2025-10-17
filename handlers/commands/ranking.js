// handlers/commands/ranking.js
const generateRankingHub = require('../../ui/ranking/rankingHub.js');

module.exports = {
    customId: 'ranking',
    async execute(interaction) {
        await interaction.reply(generateRankingHub());
    }
};