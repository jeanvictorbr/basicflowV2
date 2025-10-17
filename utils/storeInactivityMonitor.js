// Crie em: utils/storeInactivityMonitor.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');

async function checkInactiveCarts(client) {
    console.log('[Store Monitor] A verificar carrinhos inativos...');
    try {
        const guildsWithMonitor = await db.query('SELECT guild_id, store_log_channel_id, store_auto_close_hours FROM guild_settings WHERE store_inactivity_monitor_enabled = true');

        for (const settings of guildsWithMonitor.rows) {
            const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
            if (!guild) continue;

            const autoCloseHours = settings.store_auto_close_hours || 24;
            const inactiveCarts = await db.query(
                `SELECT * FROM store_carts WHERE guild_id = $1 AND (status = 'open' OR status = 'payment') AND last_activity_at < NOW() - INTERVAL '${autoCloseHours} hours'`,
                [settings.guild_id]
            );

            for (const cart of inactiveCarts.rows) {
                const channel = await guild.channels.fetch(cart.channel_id).catch(() => null);
                if (channel) {
                    console.log(`[Store Monitor] A fechar carrinho inativo #${channel.name} no servidor ${guild.name}.`);
                    
                    const closingEmbed = new EmbedBuilder()
                        .setColor('#E74C3C')
                        .setTitle('🛒 Carrinho Fechado por Inatividade')
                        .setDescription(`Este carrinho de compras foi fechado automaticamente por inatividade superior a ${autoCloseHours} horas. Este canal será eliminado em 30 segundos.`);
                        
                    await channel.send({ embeds: [closingEmbed] });

                    setTimeout(async () => {
                        await channel.delete('Carrinho fechado por inatividade.').catch(err => console.error(`[Store Monitor] Falha ao eliminar o canal ${channel.id}:`, err));
                    }, 30000);
                }
                await db.query('DELETE FROM store_carts WHERE channel_id = $1', [cart.channel_id]);
            }
        }
    } catch (error) {
        console.error('[Store Monitor] Erro durante a verificação de carrinhos inativos:', error);
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