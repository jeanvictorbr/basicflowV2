const db = require('../database.js');

// Função para buscar o status do bot
async function getBotStatus() {
    const status = await db.query("SELECT * FROM bot_status WHERE status_key = 'main'");
    return status.rows[0];
}

// Busca dados do Discord + Banco de Dados para o painel de gerenciamento
async function getAndPrepareGuildData(client, sortType = 'default') {
    // 1. Buscar configurações e dados cruciais do DB
    const [settingsRes, featuresRes, activityRes] = await Promise.all([
        db.query('SELECT * FROM guild_settings'),
        db.query('SELECT guild_id, feature_key, expires_at FROM guild_features WHERE expires_at > NOW()'),
        db.query('SELECT guild_id, MAX(timestamp) as last_active, COUNT(*) as total_interactions FROM interaction_logs GROUP BY guild_id')
    ]);

    const dbGuildsMap = new Map(settingsRes.rows.map(g => [g.guild_id, g]));
    
    // Mapa de Features: GuildID -> Array de Features
    const featuresMap = new Map();
    featuresRes.rows.forEach(row => {
        if (!featuresMap.has(row.guild_id)) featuresMap.set(row.guild_id, []);
        featuresMap.get(row.guild_id).push(row.feature_key);
    });

    // Mapa de Atividade: GuildID -> { last_active, total }
    const activityMap = new Map(activityRes.rows.map(row => [
        row.guild_id, 
        { 
            lastActive: row.last_active ? new Date(row.last_active).getTime() : 0, 
            total: parseInt(row.total_interactions) 
        }
    ]));

    // 2. Buscar guildas onde o bot está
    const currentGuilds = client.guilds.cache; 
    
    const allGuildData = [];
    const totals = { active: 0, maintenance: 0, premium: 0 };

    // 3. Combinar dados
    for (const [id, guild] of currentGuilds) {
        const settings = dbGuildsMap.get(id) || {};
        const features = featuresMap.get(id) || [];
        const activity = activityMap.get(id) || { lastActive: 0, total: 0 };
        
        // Contabilizar estatísticas
        totals.active++;
        if (settings.maintenance_mode) totals.maintenance++;
        if (features.length > 0) totals.premium++;

        allGuildData.push({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount || 0,
            joinedAt: guild.joinedAt,
            iconURL: guild.iconURL(),
            ownerId: guild.ownerId,
            // Dados Enriquecidos
            features: features,
            isPremium: features.length > 0,
            lastActiveTimestamp: activity.lastActive,
            totalInteractions: activity.total,
            maintenance: !!settings.maintenance_mode,
            settings: settings 
        });
    }

    // 4. Ordenação Avançada
    if (sortType === 'inactive') {
        // Ordenar por "Menos Ativos" (Menor timestamp primeiro)
        // Servidores sem interação (0) aparecem no topo
        allGuildData.sort((a, b) => a.lastActiveTimestamp - b.lastActiveTimestamp);
    } else if (sortType === 'active') {
        // Mais ativos (Maior timestamp primeiro)
        allGuildData.sort((a, b) => b.lastActiveTimestamp - a.lastActiveTimestamp);
    } else {
        // Padrão: Membros (Maiores primeiro)
        allGuildData.sort((a, b) => b.memberCount - a.memberCount);
    }

    return { allGuildData, totals };
}

// Função para buscar e separar as guilds (Select Menus)
async function getGuilds(client) {
    const guilds = client.guilds.cache;
    const devGuilds = [];
    const allGuilds = [];
    const devGuildId = process.env.DEV_GUILD_ID;

    for (const [id, guild] of guilds) {
        const guildData = {
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
        };
        if (id === devGuildId) {
            devGuilds.push(guildData);
        }
        allGuilds.push(guildData);
    }
    return { devGuilds, allGuilds };
}

async function formatGuilds(client) {
    const { devGuilds, allGuilds } = await getGuilds(client);

    const format = (guildsList) => {
        if (!guildsList || guildsList.length === 0) {
            return [{ label: "Nenhum servidor encontrado", value: "null", description: "O bot não está em outros servidores." }];
        }
        return guildsList
            .sort((a, b) => b.memberCount - a.memberCount)
            .slice(0, 25)
            .map(guild => ({
                label: guild.name.substring(0, 100),
                value: guild.id,
                description: `ID: ${guild.id} | Membros: ${guild.memberCount}`.substring(0, 100)
            }));
    };

    return {
        devGuildOptions: format(devGuilds),
        allGuildOptions: format(allGuilds)
    };
}

module.exports = {
    getBotStatus,
    getAndPrepareGuildData,
    getGuilds,
    formatGuilds
};