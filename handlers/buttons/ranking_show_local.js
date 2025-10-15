// handlers/buttons/ranking_show_local.js
const db = require('../../database.js');
const generateLocalRankingMenu = require('../../ui/ranking/localRankingMenu.js');
const { getRankingData } = require('./ranking_local_page.js'); // Reutiliza a função de busca

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ranking_show_local',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Por padrão, abre o ranking de Ponto
        const type = 'ponto';
        const { ranking, total } = await getRankingData(interaction.guild.id, type, 0);

        await interaction.editReply({
            components: generateLocalRankingMenu(type, ranking, total, 0, interaction.guild),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};