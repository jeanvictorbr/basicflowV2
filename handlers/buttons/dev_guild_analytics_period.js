const generateDevGuildAnalyticsDashboard = require('../../ui/devPanel/devGuildAnalyticsDashboard.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_analytics_period_',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate();
        }

        const parts = interaction.customId.split('_');
        const guildId = parts[parts.length - 1];
        const period = parts[parts.length - 2]; // '7d', '30d', ou 'total'

        let timeFilter = "";
        if (period === '7d') {
            timeFilter = "AND timestamp >= NOW() - INTERVAL '7 days'";
        } else if (period === '30d') {
            timeFilter = "AND timestamp >= NOW() - INTERVAL '30 days'";
        }

        try {
            const guild = interaction.client.guilds.cache.get(guildId);
            const guildName = guild ? guild.name : `ID: ${guildId}`;

            // 1. Dados Gerais
            const generalStats = (await db.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(DISTINCT user_id) as unique_users
                FROM interaction_logs
                WHERE guild_id = $1 ${timeFilter}
            `, [guildId])).rows[0];

            // 2. Top Usuários
            const topUsers = (await db.query(`
                SELECT user_id, COUNT(*) as count
                FROM interaction_logs
                WHERE guild_id = $1 ${timeFilter}
                GROUP BY user_id
                ORDER BY count DESC
                LIMIT 5
            `, [guildId])).rows;

            // 3. Top Comandos (Usando 'command')
            const topCommands = (await db.query(`
                SELECT name, COUNT(*) as count
                FROM interaction_logs
                WHERE guild_id = $1 AND type = 'command' ${timeFilter}
                GROUP BY name
                ORDER BY count DESC
                LIMIT 5
            `, [guildId])).rows;

            // 4. Top Módulos
            const topModules = (await db.query(`
                SELECT module, COUNT(*) as count
                FROM interaction_logs
                WHERE guild_id = $1 AND module IS NOT NULL ${timeFilter}
                GROUP BY module
                ORDER BY count DESC
                LIMIT 5
            `, [guildId])).rows;

            const stats = {
                general: generalStats,
                topUsers,
                topCommands,
                topModules
            };

            const payload = {
                components: generateDevGuildAnalyticsDashboard(stats, guildName, guildId, period),
                flags: V2_FLAG | EPHEMERAL_FLAG
            };

            await interaction.editReply(payload);

        } catch (error) {
            console.error("[DevGuildAnalytics] Erro:", error);
            // Tenta responder erro amigável se possível
            if(!interaction.replied) {
                 await interaction.followUp({ content: "❌ Erro ao processar dados da guilda.", flags: EPHEMERAL_FLAG });
            }
        }
    }
};