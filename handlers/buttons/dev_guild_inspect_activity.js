// Crie em: handlers/buttons/dev_guild_inspect_activity.js
// Este arquivo será um handler dinâmico, mas por simplicidade vamos criá-lo assim.
// O ideal seria criar um handler para 'dev_guild_inspect_activity_'
// e outro para 'dev_guild_analytics_period_'

// Por simplicidade, vou unificar a lógica aqui, mas o ideal seria separar em dois handlers.
const db = require('../../database.js');
const generateGuildAnalyticsDashboard = require('../../ui/devPanel/devGuildAnalyticsDashboard.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

async function getGuildAnalytics(guildId, days) {
    const interval = `${days} days`;

    const [
        summary,
        topCommands,
        topButtons,
        actionLog,
    ] = await Promise.all([
        db.query(`
            SELECT
                COUNT(*) as total_interactions,
                COUNT(DISTINCT user_id) as active_users,
                (SELECT module FROM interaction_logs WHERE guild_id = $1 AND timestamp >= NOW() - $2::interval GROUP BY module ORDER BY COUNT(*) DESC LIMIT 1) as top_module
            FROM interaction_logs WHERE guild_id = $1 AND timestamp >= NOW() - $2::interval
        `, [guildId, interval]),
        db.query(`SELECT name, COUNT(*) as count FROM interaction_logs WHERE guild_id = $1 AND type = 'command' AND timestamp >= NOW() - $2::interval GROUP BY name ORDER BY count DESC LIMIT 5`, [guildId, interval]),
        db.query(`SELECT name, COUNT(*) as count FROM interaction_logs WHERE guild_id = $1 AND type = 'button' AND timestamp >= NOW() - $2::interval GROUP BY name ORDER BY count DESC LIMIT 5`, [guildId, interval]),
        db.query(`SELECT * FROM interaction_logs WHERE guild_id = $1 AND timestamp >= NOW() - $2::interval ORDER BY timestamp DESC LIMIT 10`, [guildId, interval])
    ]);

    return {
        summary: summary.rows[0],
        topCommands: topCommands.rows,
        topButtons: topButtons.rows,
        actionLog: actionLog.rows,
    };
}


module.exports = {
    customId: 'dev_guild_inspect_activity_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const guildId = interaction.customId.split('_')[4];
        const guild = interaction.client.guilds.cache.get(guildId);
        
        // Período padrão de 7 dias
        const stats = await getGuildAnalytics(guildId, 7);

        await interaction.editReply({
            components: generateGuildAnalyticsDashboard(guild, stats, 7),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};