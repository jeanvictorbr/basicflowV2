// Crie em: utils/devPanelUtils.js
const db = require('../database.js');

async function getAndPrepareGuildData(client, sortKey = 'default') {
    const guilds = Array.from(client.guilds.cache.values());

    const query = `
        SELECT guild_id, ponto_status, registros_status, tickets_category, 
               guardian_ai_enabled, roletags_enabled, suggestions_enabled,
               store_enabled
        FROM guild_settings
    `;
    const settingsResult = await db.query(query);
    
    const ownerPromises = guilds.map(g => g.fetchOwner().then(owner => ({ id: g.id, ownerTag: owner.user.tag })).catch(() => ({ id: g.id, ownerTag: 'N/A' })));
    const owners = await Promise.all(ownerPromises);
    const ownerMap = new Map(owners.map(o => [o.id, o.ownerTag]));

    let allGuildData = [];
    for (const guild of guilds) {
        const setting = settingsResult.rows.find(s => s.guild_id === guild.id) || {};
        
        const expiryResult = await db.query('SELECT MAX(expires_at) as expires_at FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guild.id]);
        const featuresResult = await db.query('SELECT feature_key FROM guild_features WHERE guild_id = $1 AND expires_at > NOW()', [guild.id]);
        const aiStats = (await db.query(`SELECT SUM(total_tokens) AS total_tokens_used, SUM(cost) AS total_cost FROM ai_usage_logs WHERE guild_id = $1`, [guild.id])).rows[0];
        const topFeature = (await db.query(`SELECT feature_name FROM ai_usage_logs WHERE guild_id = $1 GROUP BY feature_name ORDER BY SUM(total_tokens) DESC LIMIT 1`, [guild.id])).rows[0];
        
        const tickets_30d_query = `SELECT COUNT(*) FROM tickets WHERE guild_id = $1 AND ((channel_id::bigint >> 22) + 1420070400000) >= (EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000)`;
        const tickets_30d = (await db.query(tickets_30d_query, [guild.id])).rows[0].count;
        const sales_30d = (await db.query(`SELECT COUNT(*) FROM store_sales_log WHERE guild_id = $1 AND status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'`, [guild.id])).rows[0].count;
        const suggestions_30d = (await db.query(`SELECT COUNT(*) FROM suggestions WHERE guild_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`, [guild.id])).rows[0].count;

        allGuildData.push({
            guild_id: guild.id, name: guild.name, memberCount: guild.memberCount, joinedAt: guild.joinedAt, ownerTag: ownerMap.get(guild.id),
            premium_expires_at: expiryResult.rows[0]?.expires_at,
            tickets_configurado: !!setting.tickets_category, ponto_status: setting.ponto_status, registros_status: setting.registros_status,
            guardian_ai_enabled: setting.guardian_ai_enabled, roletags_enabled: setting.roletags_enabled, suggestions_enabled: setting.suggestions_enabled,
            store_enabled: setting.store_enabled,
            store_premium: featuresResult.rows.some(r => r.feature_key === 'STORE_AUTOMATION' || r.feature_key === 'CUSTOM_VISUALS'),
            activity_tickets: tickets_30d, activity_sales: sales_30d, activity_suggestions: suggestions_30d,
            total_tokens_used: parseInt(aiStats.total_tokens_used) || 0, total_cost: parseFloat(aiStats.total_cost) || 0.0,
            top_feature: topFeature?.feature_name || 'N/A',
        });
    }
    
    switch(sortKey) {
        case 'members': allGuildData.sort((a, b) => b.memberCount - a.memberCount); break;
        case 'ai_usage': allGuildData.sort((a, b) => b.total_tokens_used - a.total_tokens_used); break;
        case 'expiry': allGuildData.sort((a, b) => (new Date(a.premium_expires_at) || 0) - (new Date(b.premium_expires_at) || 0)); break;
        default: allGuildData.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    const totals = {
        totalGuilds: client.guilds.cache.size,
        totalMembers: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
    };

    return { allGuildData, totals };
}

module.exports = { getAndPrepareGuildData };