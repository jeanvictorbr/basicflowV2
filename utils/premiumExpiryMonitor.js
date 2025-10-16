// Substitua o conteúdo em: utils/punishmentMonitor.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const ms = require('ms');

async function checkExpiredPunishments(client) {
    console.log('[MOD MONITOR] Verificando punições expiradas...');
    // CORREÇÃO: Toda a lógica agora está dentro do db.withClient
    await db.withClient(async (dbClient) => {
        try {
            const guildsWithMonitor = (await dbClient.query('SELECT guild_id, mod_monitor_channel FROM guild_settings WHERE mod_monitor_enabled = true AND mod_monitor_channel IS NOT NULL')).rows;

            for (const settings of guildsWithMonitor) {
                const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
                if (!guild) continue;

                const logChannel = await guild.channels.fetch(settings.mod_monitor_channel).catch(() => null);
                if (!logChannel) continue;

                // Verifica timeouts diretamente pela API do Discord
                const membersWithTimeout = await guild.members.list({ limit: 1000 });
                membersWithTimeout.forEach(async member => {
                    if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > 0 && member.communicationDisabledUntilTimestamp < Date.now()) {
                        try {
                            await member.timeout(null, 'Punição expirada automaticamente.');
                            const embed = new EmbedBuilder().setColor('Green').setTitle('🔇 Silenciamento Expirado').setDescription(`${member} não está mais silenciado.`).setTimestamp();
                            if (logChannel) await logChannel.send({ embeds: [embed] });
                        } catch (err) {
                            console.error(`[MOD MONITOR] Falha ao remover timeout do membro ${member.id}:`, err.message);
                        }
                    }
                });

                // Verifica bans temporários no banco de dados
                const tempBans = (await dbClient.query("SELECT * FROM moderation_logs WHERE guild_id = $1 AND action = 'BAN' AND duration IS NOT NULL", [guild.id])).rows;
                for (const ban of tempBans) {
                    try {
                        const createdAt = new Date(ban.created_at).getTime();
                        const duration = ms(ban.duration);
                        if (createdAt + duration < Date.now()) {
                            await guild.members.unban(ban.user_id, 'Banimento temporário expirado.');
                            const embed = new EmbedBuilder().setColor('Green').setTitle('🚫 Banimento Expirado').setDescription(`O banimento de <@${ban.user_id}> (\`${ban.user_id}\`) expirou e foi removido.`).setTimestamp();
                            if (logChannel) await logChannel.send({ embeds: [embed] });
                            await dbClient.query('DELETE FROM moderation_logs WHERE case_id = $1', [ban.case_id]);
                        }
                    } catch (err) {
                        // Se o ban não existe mais (Unknown Ban), apenas removemos o log.
                        if (err.code === 10026) {
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
    }); // O cliente do DB é liberado automaticamente aqui
}

module.exports = { checkExpiredPunishments };