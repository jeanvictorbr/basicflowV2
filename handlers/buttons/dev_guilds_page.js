// Substitua o conteúdo em: handlers/buttons/dev_guilds_page.js
const db = require('../../database.js');
const generateDevGuildsMenu = require('../../ui/devPanel/devGuildsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guilds_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const guilds = Array.from(interaction.client.guilds.cache.values());

        const settingsResult = await db.query('SELECT guild_id, ponto_status, registros_status, tickets_category, guardian_ai_enabled, roletags_enabled FROM guild_settings');
        
        const ownerPromises = guilds.map(g => g.fetchOwner().then(owner => ({ id: g.id, ownerTag: owner.user.tag })).catch(() => ({ id: g.id, ownerTag: 'N/A' })));
        const owners = await Promise.all(ownerPromises);
        const ownerMap = new Map(owners.map(o => [o.id, o.ownerTag]));

        const allGuildData = [];
        for (const guild of guilds) {
            const setting = settingsResult.rows.find(s => s.guild_id === guild.id) || {};
            
            const expiryResult = await db.query('SELECT MAX(expires_at) as expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guild.id]);
            
            const aiStats = (await db.query(`
                SELECT
                    SUM(total_tokens) AS total_tokens_used,
                    SUM(cost) AS total_cost
                FROM ai_usage_logs
                WHERE guild_id = $1
            `, [guild.id])).rows[0];

            const topFeature = (await db.query(`
                SELECT feature_name
                FROM ai_usage_logs
                WHERE guild_id = $1
                GROUP BY feature_name
                ORDER BY SUM(total_tokens) DESC
                LIMIT 1
            `, [guild.id])).rows[0];

            allGuildData.push({
                guild_id: guild.id,
                name: guild.name,
                memberCount: guild.memberCount,
                joinedAt: guild.joinedAt,
                ownerTag: ownerMap.get(guild.id),
                premium_expires_at: expiryResult.rows[0].expires_at,
                ponto_status: setting.ponto_status,
                registros_status: setting.registros_status,
                tickets_configurado: !!setting.tickets_category,
                guardian_ai_enabled: setting.guardian_ai_enabled,
                roletags_enabled: setting.roletags_enabled,
                total_tokens_used: parseInt(aiStats.total_tokens_used) || 0,
                total_cost: parseFloat(aiStats.total_cost) || 0.0,
                top_feature: topFeature?.feature_name || 'N/A',
            });
        }
        
        const totals = {
            totalGuilds: interaction.client.guilds.cache.size,
            totalMembers: interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
        };
        
        await interaction.editReply({
            components: generateDevGuildsMenu(allGuildData, page, totals),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};