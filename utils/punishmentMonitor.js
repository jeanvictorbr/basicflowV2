// Caminho: utils/punishmentMonitor.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const ms = require('ms');

async function checkExpiredPunishments(client) {
    console.log('[MOD MONITOR] Verificando punições expiradas...');
    await db.withClient(async (dbClient) => { // <-- USA withClient
        try {
            const guildsWithMonitor = (await dbClient.query('SELECT guild_id, mod_monitor_channel FROM guild_settings WHERE mod_monitor_enabled = true AND mod_monitor_channel IS NOT NULL')).rows;

            for (const settings of guildsWithMonitor) {
                const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
                if (!guild) continue;

                const logChannel = await guild.channels.fetch(settings.mod_monitor_channel).catch(() => null);
                
                const tempBans = (await dbClient.query("SELECT * FROM moderation_logs WHERE guild_id = $1 AND action = 'BAN' AND duration IS NOT NULL", [guild.id])).rows;
                for (const ban of tempBans) {
                    try {
                        const createdAt = new Date(ban.created_at).getTime();
                        const duration = ms(ban.duration);
                        if (createdAt + duration < Date.now()) {
                            await guild.members.unban(ban.user_id, 'Banimento temporário expirado.');
                            if (logChannel) {
                                const embed = new EmbedBuilder().setColor('Green').setTitle('🚫 Banimento Expirado').setDescription(`O banimento de <@${ban.user_id}> (\`${ban.user_id}\`) expirou e foi removido.`).setTimestamp();
                                await logChannel.send({ embeds: [embed] });
                            }
                            await dbClient.query('DELETE FROM moderation_logs WHERE case_id = $1', [ban.case_id]);
                        }
                    } catch (err) {
                        if (err.code === 10026) { // Unknown Ban
                            await dbClient.query('DELETE FROM moderation_logs WHERE case_id = $1', [ban.case_id]);
                        } else {
                           console.error(`[MOD MONITOR] Falha ao remover ban do user ${ban.user_id}:`, err.message);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[MOD MONITOR] Erro durante a verificação de punições:', error);
        }
    });
}

module.exports = { checkExpiredPunishments };