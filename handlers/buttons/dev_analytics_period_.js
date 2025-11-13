const generateDevAnalyticsDashboard = require('../../ui/devPanel/devAnalyticsDashboard.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_analytics_period_',
    async execute(interaction) {
        // Se já foi diferido (pelo open_analytics), não difere de novo
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const period = interaction.customId.replace('dev_analytics_period_', '') || '7d';

        let timeFilter = "";
        if (period === '7d') {
            timeFilter = "WHERE timestamp >= NOW() - INTERVAL '7 days'";
        } else if (period === '30d') {
            timeFilter = "WHERE timestamp >= NOW() - INTERVAL '30 days'";
        }

        try {
            // 1. Estatísticas Gerais
            const generalStats = (await db.query(`
                SELECT 
                    COUNT(*) as total_interactions,
                    COUNT(DISTINCT guild_id) as active_guilds,
                    COUNT(DISTINCT user_id) as active_users
                FROM interaction_logs
                ${timeFilter}
            `)).rows[0];

            // 2. Top Comandos (CORRIGIDO: type = 'command')
            const topCommands = (await db.query(`
                SELECT name, COUNT(*) as count 
                FROM interaction_logs 
                ${timeFilter ? timeFilter + " AND" : "WHERE"} type = 'command'
                GROUP BY name 
                ORDER BY count DESC 
                LIMIT 5
            `)).rows;

            // 3. Top Botões (CORRIGIDO: type = 'button')
            const topButtons = (await db.query(`
                SELECT name, COUNT(*) as count 
                FROM interaction_logs 
                ${timeFilter ? timeFilter + " AND" : "WHERE"} type = 'button'
                GROUP BY name 
                ORDER BY count DESC 
                LIMIT 5
            `)).rows;

            // 4. Top Módulos
            const topModules = (await db.query(`
                SELECT module, COUNT(*) as count 
                FROM interaction_logs 
                ${timeFilter ? timeFilter + " AND" : "WHERE"} module IS NOT NULL
                GROUP BY module 
                ORDER BY count DESC 
                LIMIT 5
            `)).rows;

            // 5. Top Guilds
            const topGuilds = (await db.query(`
                SELECT guild_id, COUNT(*) as count 
                FROM interaction_logs 
                ${timeFilter}
                GROUP BY guild_id 
                ORDER BY count DESC 
                LIMIT 5
            `)).rows;

            const stats = {
                general: generalStats,
                topCommands,
                topButtons,
                topModules,
                topGuilds
            };

            const payload = {
                components: generateDevAnalyticsDashboard(stats, interaction.client, period),
                flags: V2_FLAG | EPHEMERAL_FLAG
            };

            await interaction.editReply(payload);

        } catch (error) {
            console.error("[DevAnalytics] Erro ao buscar dados:", error);
            await interaction.followUp({ content: "❌ Erro ao buscar dados de analytics.", flags: EPHEMERAL_FLAG });
        }
    }
};