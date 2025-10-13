// Substitua o conteúdo em: handlers/buttons/dev_guild_analytics_period.js
const db = require('../../database.js');
const generateGuildAnalyticsDashboard = require('../../ui/devPanel/devGuildAnalyticsDashboard.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

// Reutilizamos a função de busca
async function getGuildAnalytics(guildId, days) {
    const interval = `${days} days`;
    const [summary, topCommands, topButtons, actionLog] = await Promise.all([
        db.query(`SELECT COUNT(*) as total_interactions, COUNT(DISTINCT user_id) as active_users, (SELECT module FROM interaction_logs WHERE guild_id = $1 AND timestamp >= NOW() - $2::interval GROUP BY module ORDER BY COUNT(*) DESC LIMIT 1) as top_module FROM interaction_logs WHERE guild_id = $1 AND timestamp >= NOW() - $2::interval`, [guildId, interval]),
        db.query(`SELECT name, COUNT(*) as count FROM interaction_logs WHERE guild_id = $1 AND type = 'command' AND timestamp >= NOW() - $2::interval GROUP BY name ORDER BY count DESC LIMIT 5`, [guildId, interval]),
        db.query(`SELECT name, COUNT(*) as count FROM interaction_logs WHERE guild_id = $1 AND type = 'button' AND timestamp >= NOW() - $2::interval GROUP BY name ORDER BY count DESC LIMIT 5`, [guildId, interval]),
        db.query(`SELECT * FROM interaction_logs WHERE guild_id = $1 AND timestamp >= NOW() - $2::interval ORDER BY timestamp DESC LIMIT 10`, [guildId, interval])
    ]);
    return { summary: summary.rows[0], topCommands: topCommands.rows, topButtons: topButtons.rows, actionLog: actionLog.rows };
}

module.exports = {
    customId: 'dev_guild_analytics_period_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        
        // --- CORREÇÃO APLICADA AQUI ---
        // Extrai as partes do customId de forma segura, pelos índices corretos.
        const parts = interaction.customId.split('_');
        const guildId = parts[4];
        const period = parts[5];
        // --- FIM DA CORREÇÃO ---
        
        const guild = interaction.client.guilds.cache.get(guildId);
        if (!guild) {
            return interaction.followUp({ content: 'Guilda não encontrada.', ephemeral: true });
        }
        
        const stats = await getGuildAnalytics(guildId, parseInt(period, 10));

        await interaction.editReply({
            components: generateGuildAnalyticsDashboard(guild, stats, parseInt(period, 10)),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};