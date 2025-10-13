// Crie em: handlers/buttons/dev_open_analytics.js
const { getGlobalAnalytics } = require('../../utils/analyticsUtils.js');
const generateDevAnalyticsDashboard = require('../../ui/devPanel/devAnalyticsDashboard.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_analytics',
    async execute(interaction) {
        await interaction.deferUpdate();

        const stats = await getGlobalAnalytics(7); // Padrão de 7 dias

        await interaction.editReply({
            components: generateDevAnalyticsDashboard(stats, interaction.client),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};