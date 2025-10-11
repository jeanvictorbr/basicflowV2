// Crie em: utils/devPanelUtils.js
const db = require('../database.js');

async function getAndPrepareGuildData(client, sortKey = 'default') {
    const guilds = Array.from(client.guilds.cache.values());
    const guildIds = guilds.map(g => g.id);

    if (guildIds.length === 0) {
        return { allGuildData: [], totals: { totalGuilds: 0, totalMembers: 0 } };
    }

    // --- OTIMIZAÇÃO: Consultas em massa ---
    const settingsQuery = db.query('SELECT guild_id, ponto_status, registros_status, tickets_category, guardian_ai_enabled, roletags_enabled, suggestions_enabled, store_enabled FROM guild_settings WHERE guild_id = ANY($1::text[])', [guildIds]);
    const expiryQuery = db.query("SELECT guild_id, MAX(expires_at) as expires_at FROM guild_features WHERE guild_id = ANY($1::text[]) AND expires_at > NOW() GROUP BY guild_id", [guildIds]);
    const featuresQuery = db.query('SELECT guild_id, feature_key FROM guild_features WHERE guild_id = ANY($1::text[]) AND expires_at > NOW()', [guildIds]);
    const aiStatsQuery = db.query("SELECT guild_id, SUM(total_tokens) AS total_tokens_used, SUM(cost) AS total_cost FROM ai_usage_logs WHERE guild_id = ANY($1::text[]) GROUP BY guild_id", [guildIds]);
    const topFeatureQuery = db.query(`
        WITH RankedFeatures AS (
            SELECT guild_id, feature_name, SUM(total_tokens) as total, ROW_NUMBER() OVER(PARTITION BY guild_id ORDER BY SUM(total_tokens) DESC) as rn
            FROM ai_usage_logs WHERE guild_id = ANY($1::text[]) GROUP BY guild_id, feature_name
        )
        SELECT guild_id, feature_name FROM RankedFeatures WHERE rn = 1;
    `, [guildIds]);
    const activityQuery = db.query(`
        SELECT
            guild_id,
            (SELECT COUNT(*) FROM tickets WHERE guild_id = s.guild_id AND ((channel_id::bigint >> 22) + 1420070400000) >= (EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000)) as activity_tickets,
            (SELECT COUNT(*) FROM store_sales_log WHERE guild_id = s.guild_id AND status = 'completed' AND created_at >= NOW() - INTERVAL '30 days') as activity_sales,
            (SELECT COUNT(*) FROM suggestions WHERE guild_id = s.guild_id AND created_at >= NOW() - INTERVAL '30 days') as activity_suggestions
        FROM guild_settings s WHERE s.guild_id = ANY($1::text[])
    `, [guildIds]);
    
    const ownerPromises = guilds.map(g => g.fetchOwner().then(owner => ({ id: g.id, ownerTag: owner.user.tag })).catch(() => ({ id: g.id, ownerTag: 'N/A' })));

    const [settingsResult, expiryResult, featuresResult, aiStatsResult, topFeatureResult, activityResult, owners] = await Promise.all([
        settingsQuery, expiryQuery, featuresQuery, aiStatsQuery, topFeatureQuery, activityQuery, Promise.all(ownerPromises)
    ]);
    
    const settingsMap = new Map(settingsResult.rows.map(s => [s.guild_id, s]));
    const expiryMap = new Map(expiryResult.rows.map(e => [e.guild_id, e.expires_at]));
    const featuresMap = new Map();
    featuresResult.rows.forEach(f => {
        if (!featuresMap.has(f.guild_id)) featuresMap.set(f.guild_id, []);
        featuresMap.get(f.guild_id).push(f.feature_key);
    });
    const aiStatsMap = new Map(aiStatsResult.rows.map(a => [a.guild_id, a]));
    const topFeatureMap = new Map(topFeatureResult.rows.map(t => [t.guild_id, t.feature_name]));
    const activityMap = new Map(activityResult.rows.map(a => [a.guild_id, a]));
    const ownerMap = new Map(owners.map(o => [o.id, o.ownerTag]));
    // --- FIM DA OTIMIZAÇÃO ---

    let allGuildData = guilds.map(guild => {
        const setting = settingsMap.get(guild.id) || {};
        const aiStats = aiStatsMap.get(guild.id) || {};
        const activity = activityMap.get(guild.id) || {};
        const features = featuresMap.get(guild.id) || [];

        return {
            guild_id: guild.id, name: guild.name, memberCount: guild.memberCount, joinedAt: guild.joinedAt, ownerTag: ownerMap.get(guild.id),
            premium_expires_at: expiryMap.get(guild.id),
            tickets_configurado: !!setting.tickets_category, ponto_status: setting.ponto_status, registros_status: setting.registros_status,
            guardian_ai_enabled: setting.guardian_ai_enabled, roletags_enabled: setting.roletags_enabled, suggestions_enabled: setting.suggestions_enabled,
            store_enabled: setting.store_enabled,
            store_premium: features.some(f => f === 'STORE_AUTOMATION' || f === 'CUSTOM_VISUALS'),
            activity_tickets: activity.activity_tickets || 0, activity_sales: activity.activity_sales || 0, activity_suggestions: activity.activity_suggestions || 0,
            total_tokens_used: parseInt(aiStats.total_tokens_used) || 0, total_cost: parseFloat(aiStats.total_cost) || 0.0,
            top_feature: topFeatureMap.get(guild.id) || 'N/A',
        };
    });
    
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