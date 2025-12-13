// utils/statsMonitor.js
const db = require('../database.js');

/**
 * Inicia o loop de atualização das estatísticas
 * @param {import('discord.js').Client} client 
 */
function startStatsMonitor(client) {
    console.log('📊 [Stats Monitor] Iniciado. Atualizando a cada 10 minutos.');

    // Executa a primeira vez após 10 segundos para dar tempo do bot carregar
    setTimeout(() => runUpdate(client), 10 * 1000);

    // Repete a cada 10 minutos (600.000 ms)
    setInterval(() => runUpdate(client), 10 * 60 * 1000);
}

async function runUpdate(client) {
    try {
        // Busca todas as guilds que têm o sistema ativado
        const result = await db.query(`
            SELECT guild_id, stats_members_channel_id, stats_clients_channel_id, store_client_role_id, stats_format_members, stats_format_clients 
            FROM guild_settings 
            WHERE stats_enabled = true
        `);

        for (const row of result.rows) {
            const guild = client.guilds.cache.get(row.guild_id);
            if (!guild) continue;

            // --- ATUALIZAR CONTADOR DE MEMBROS ---
            if (row.stats_members_channel_id) {
                const channel = guild.channels.cache.get(row.stats_members_channel_id);
                if (channel) {
                    const newName = (row.stats_format_members || '👥 Membros: {count}')
                        .replace('{count}', guild.memberCount.toLocaleString('pt-BR'));
                    
                    // Só atualiza se o nome mudou para economizar API calls
                    if (channel.name !== newName) {
                        await channel.setName(newName).catch(e => console.error(`[Stats] Erro ao renomear canal de membros: ${e.message}`));
                    }
                }
            }

            // --- ATUALIZAR CONTADOR DE CLIENTES ---
            if (row.stats_clients_channel_id && row.store_client_role_id) {
                const channel = guild.channels.cache.get(row.stats_clients_channel_id);
                if (channel) {
                    try {
                        // Força fetch para garantir contagem exata (caches podem mentir)
                        await guild.members.fetch(); 
                        const role = guild.roles.cache.get(row.store_client_role_id);
                        
                        const clientCount = role ? role.members.size : 0;
                        const newName = (row.stats_format_clients || '💼 Clientes: {count}')
                            .replace('{count}', clientCount.toLocaleString('pt-BR'));

                        if (channel.name !== newName) {
                            await channel.setName(newName).catch(e => console.error(`[Stats] Erro ao renomear canal de clientes: ${e.message}`));
                        }
                    } catch (err) {
                        console.error(`[Stats] Erro ao calcular clientes na guild ${guild.id}:`, err.message);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Stats Monitor] Erro fatal no loop:', error);
    }
}

module.exports = { startStatsMonitor };