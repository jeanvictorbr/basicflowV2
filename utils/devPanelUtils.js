const db = require('../database.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('./constants.js');

// Função para buscar o status do bot
async function getBotStatus() {
    const status = await db.query("SELECT * FROM bot_status WHERE status_key = 'main'");
    return status.rows[0];
}

// Busca dados do Discord + Banco de Dados para o painel de gerenciamento
async function getAndPrepareGuildData(client) {
    // 1. Buscar configurações salvas no DB
    const { rows: dbGuilds } = await db.query('SELECT * FROM guild_settings');
    const dbGuildsMap = new Map(dbGuilds.map(g => [g.guild_id, g]));

    // 2. Buscar guildas onde o bot está (Cache é mais rápido que fetch)
    const currentGuilds = client.guilds.cache; 
    
    const allGuildData = [];
    const totals = {
        active: 0,
        maintenance: 0,
        premium: 0
    };

    // 3. Combinar dados
    for (const [id, guild] of currentGuilds) {
        const settings = dbGuildsMap.get(id) || {};
        
        // Contabilizar estatísticas
        totals.active++;
        if (settings.maintenance_mode) totals.maintenance++;
        // Verifica se é premium
        if (settings.is_premium || (settings.premium_tier && settings.premium_tier > 0)) totals.premium++;

        allGuildData.push({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount || 0,
            joinedAt: guild.joinedAt,
            iconURL: guild.iconURL(),
            // Dados do DB
            isPremium: !!(settings.is_premium || (settings.premium_tier && settings.premium_tier > 0)),
            maintenance: !!settings.maintenance_mode,
            settings: settings 
        });
    }

    // 4. Ordenar por número de membros (maiores primeiro)
    allGuildData.sort((a, b) => b.memberCount - a.memberCount);

    return { allGuildData, totals };
}

// Função para buscar e separar as guilds (Usada no seletor de transferência)
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

// Função para formatar as guilds para Select Menus (V2)
async function formatGuilds(client) {
    const { devGuilds, allGuilds } = await getGuilds(client);

    const format = (guildsList) => {
        if (!guildsList || guildsList.length === 0) {
            return [{ label: "Nenhum servidor encontrado", value: "null", description: "O bot não está em outros servidores." }];
        }
        // Limita a 25 para não quebrar o select menu do Discord
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