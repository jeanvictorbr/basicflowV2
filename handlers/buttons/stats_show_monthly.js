// Crie em: handlers/buttons/stats_show_monthly.js
const { getStats } = require('./main_show_stats.js');
const generateStatsDashboard = require('../../ui/statsDashboard.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'stats_show_monthly',
    async execute(interaction) {
        await interaction.deferUpdate();
        const monthlyStats = await getStats(interaction.guild.id, 30);
        const dashboard = generateStatsDashboard(monthlyStats, 'mes');
        await interaction.editReply({
            components: dashboard,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};