// Crie em: handlers/buttons/stats_show_weekly.js
const { getStats } = require('./main_show_stats.js');
const generateStatsDashboard = require('../../ui/statsDashboard.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'stats_show_weekly',
    async execute(interaction) {
        await interaction.deferUpdate();
        const weeklyStats = await getStats(interaction.guild.id, 7);
        const dashboard = generateStatsDashboard(weeklyStats, 'semana');
        await interaction.editReply({
            components: dashboard,
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};