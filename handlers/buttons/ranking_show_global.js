// handlers/buttons/ranking_show_global.js
const openGlobalRankingHandler = require('./open_global_ranking.js');

module.exports = {
    customId: 'ranking_show_global',
    async execute(interaction) {
        // Apenas chama o handler já existente que abre o ranking global
        await openGlobalRankingHandler.execute(interaction);
    }
};