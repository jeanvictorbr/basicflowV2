// Crie em: utils/punishmentMonitor.js
const { EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const ms = require('ms');

async function checkExpiredPunishments(client) {
    console.log('[MOD MONITOR] Verificando punições expiradas...');
    try {
        const guildsWithMonitor = (await db.query('SELECT guild_id, mod_monitor_channel FROM guild_settings WHERE mod_monitor_enabled = true AND mod_monitor_channel IS NOT NULL')).rows;

        for (const settings of guildsWithMonitor) {
            const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
            if (!guild) continue;

            const logChannel = await guild.channels.fetch(settings.mod_monitor_channel).catch(() => null);
            if (!logChannel) continue;

            // Verifica Timeouts diretamente pela API do Discord
            const expiredTimeouts = await guild.members.list({ limit: 1000 });
            expiredTimeouts.forEach(async member => {
                if (member.communicationDisabledUntilTimestamp && member.communicationDisabledUntilTimestamp > 0 && member.communicationDisabledUntilTimestamp < Date.now()) {
                    try {
                        await member.timeout(null, 'Punição expirada automaticamente.');
                        const embed = new EmbedBuilder().setColor('Green').setTitle('🔇 Silenciamento Expirado').setDescription(`${member} não está mais silenciado.`).setTimestamp();
                        await logChannel.send({ embeds: [embed] });
                    } catch (err) {
                        console.error(`[MOD MONITOR] Falha ao remover timeout do membro ${member.id}:`, err.message);
                    }
                }
            });

            // Verifica Bans Temporários (usando o nosso banco de dados)
            const tempBans = (await db.query("SELECT * FROM moderation_logs WHERE guild_id = $1 AND action = 'BAN' AND duration IS NOT NULL", [guild.id])).rows;
            for (const ban of tempBans) {
                const createdAt = new Date(ban.created_at).getTime();
                const duration = ms(ban.duration);
                if (createdAt + duration < Date.now()) {
                    try {
                        await guild.members.unban(ban.user_id, 'Banimento temporário expirado.');
                        const embed = new EmbedBuilder().setColor('Green').setTitle('🚫 Banimento Expirado').setDescription(`O banimento de <@${ban.user_id}> (\`${ban.user_id}\`) expirou e foi removido.`).setTimestamp();
                        await logChannel.send({ embeds: [embed] });
                    } catch (err) {
                        // Ignora erros de "Unknown Ban", que acontecem se o ban já foi removido manualmente
                        if (err.code !== 10026) {
                           console.error(`[MOD MONITOR] Falha ao remover ban do user ${ban.user_id}:`, err.message);
                        }
                    } finally {
                        // Remove o registo do DB para não verificar novamente
                        await db.query('DELETE FROM moderation_logs WHERE case_id = $1', [ban.case_id]);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[MOD MONITOR] Erro durante a verificação de punições:', error);
    }
}

module.exports = { checkExpiredPunishments };