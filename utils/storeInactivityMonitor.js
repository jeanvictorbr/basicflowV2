// Substitua o conteúdo em: utils/storeInactivityMonitor.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');

async function checkInactiveCarts(client) {
    console.log('[Store Monitor] A verificar carrinhos inativos...');
    const dbClient = await db.getClient(); // Pega um cliente do pool
    try {
        const guildsWithMonitor = await dbClient.query('SELECT guild_id, store_log_channel_id, store_auto_close_hours FROM guild_settings WHERE store_inactivity_monitor_enabled = true');

        for (const settings of guildsWithMonitor.rows) {
            const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
            if (!guild) continue;

            const autoCloseHours = settings.store_auto_close_hours || 24;
            const inactiveCarts = await dbClient.query(
                `SELECT * FROM store_carts WHERE guild_id = $1 AND (status = 'open' OR status = 'payment') AND last_activity_at < NOW() - INTERVAL '${autoCloseHours} hours'`,
                [settings.guild_id]
            );

            for (const cart of inactiveCarts.rows) {
                await dbClient.query('DELETE FROM store_carts WHERE channel_id = $1', [cart.channel_id]);
                const channel = await guild.channels.fetch(cart.channel_id).catch(() => null);
                if (channel) {
                    const closingEmbed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('🛒 Carrinho Fechado por Inatividade')
                        .setDescription(`Este carrinho de compras foi fechado automaticamente por inatividade superior a ${autoCloseHours} horas. Este canal será eliminado em 30 segundos.`);
                    await channel.send({ embeds: [closingEmbed] });
                    setTimeout(() => channel.delete('Carrinho fechado por inatividade.').catch(() => {}), 30000);
                }
            }
        }
    } catch (error) {
        console.error('[Store Monitor] Erro durante a verificação de carrinhos inativos:', error);
    } finally {
        if (dbClient) dbClient.release(); // DEVOLVE A CONEXÃO PARA O POOL
    }
}

async function updateCartActivity(channelId) {
    try {
        await db.query('UPDATE store_carts SET last_activity_at = NOW() WHERE channel_id = $1', [channelId]);
    } catch (error) {
        console.error(`[Store Monitor] Falha ao atualizar a atividade do carrinho ${channelId}:`, error);
    }
}

module.exports = { checkInactiveCarts, updateCartActivity };