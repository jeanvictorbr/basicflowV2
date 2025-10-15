// handlers/buttons/ranking_hub_back.js
const generateRankingHub = require('../../ui/ranking/rankingHub.js');

module.exports = {
    customId: 'ranking_hub_back',
    async execute(interaction) {
        // Simplesmente atualiza a interação para mostrar o menu principal do hub de rankings
        await interaction.update(generateRankingHub());
    }
};