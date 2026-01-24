// File: utils/punishmentMonitor.js
// VERSÃO CORRIGIDA: Anti-Loop Infinito e Proteção de Hierarquia
const { EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const ms = require('ms');

async function checkExpiredPunishments(client) {
    // console.log('[MOD MONITOR] Verificando punições expiradas...'); // Comentei para reduzir spam no console
    try {
        const guildsWithMonitor = (await db.query('SELECT guild_id, mod_monitor_channel FROM guild_settings WHERE mod_monitor_enabled = true AND mod_monitor_channel IS NOT NULL')).rows;

        for (const settings of guildsWithMonitor) {
            const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
            if (!guild) continue;

            const logChannel = await guild.channels.fetch(settings.mod_monitor_channel).catch(() => null);

            // --- 1. VERIFICAÇÃO DE TIMEOUTS (Direto na API) ---
            try {
                // Fetch seguro de membros (limite 1000)
                const members = await guild.members.list({ limit: 1000 });
                const expiredMembers = members.filter(m => 
                    m.communicationDisabledUntilTimestamp && 
                    m.communicationDisabledUntilTimestamp > 0 && 
                    m.communicationDisabledUntilTimestamp < Date.now()
                );

                // Loop serializado (um por um) para não floodar
                for (const member of expiredMembers.values()) {
                    
                    // CORREÇÃO DO LOOP: Verifica se o bot pode mexer no membro
                    if (!member.manageable) {
                        // Se não pode gerenciar, ignora e tenta limpar do DB se existir registro
                        // console.warn(`[MOD MONITOR] Ignorando timeout de ${member.user.tag} (Hierarquia/Permissão)`);
                        await db.query(`UPDATE punishments SET active = false WHERE user_id = $1 AND guild_id = $2 AND type = 'timeout'`, [member.id, guild.id]).catch(() => {});
                        continue; 
                    }

                    try {
                        await member.timeout(null, 'Punição expirada automaticamente.');
                        
                        if (logChannel) {
                            const embed = new EmbedBuilder()
                                .setColor('Green')
                                .setTitle('🔇 Silenciamento Expirado')
                                .setDescription(`${member} não está mais silenciado.`)
                                .setTimestamp();
                            await logChannel.send({ embeds: [embed] }).catch(() => {});
                        }
                        
                        // Atualiza DB para constar como finalizado
                        await db.query(`UPDATE punishments SET active = false WHERE user_id = $1 AND guild_id = $2 AND type = 'timeout'`, [member.id, guild.id]).catch(() => {});

                    } catch (err) {
                        // Se der erro de permissão (50013), força a saída do loop atualizando o DB
                        if (err.code === 50013) {
                            await db.query(`UPDATE punishments SET active = false WHERE user_id = $1 AND guild_id = $2 AND type = 'timeout'`, [member.id, guild.id]).catch(() => {});
                        }
                        console.error(`[MOD MONITOR] Falha ao remover timeout de ${member.id}:`, err.message);
                    }
                }
            } catch (e) {
                // console.error(`[MOD MONITOR] Erro ao listar membros: ${e.message}`);
            }

            // --- 2. VERIFICAÇÃO DE BANS (Via Banco de Dados) ---
            const tempBans = (await db.query("SELECT * FROM moderation_logs WHERE guild_id = $1 AND action = 'BAN' AND duration IS NOT NULL", [guild.id])).rows;
            
            for (const ban of tempBans) {
                const createdAt = new Date(ban.created_at).getTime();
                // Tenta interpretar a duração com ms(), se falhar usa 0
                let duration = 0;
                try { duration = ms(ban.duration); } catch(e) {}

                if (duration > 0 && createdAt + duration < Date.now()) {
                    try {
                        await guild.members.unban(ban.user_id, 'Banimento temporário expirado.');
                        
                        if (logChannel) {
                            const embed = new EmbedBuilder()
                                .setColor('Green')
                                .setTitle('🚫 Banimento Expirado')
                                .setDescription(`O banimento de <@${ban.user_id}> expirou e foi removido.`)
                                .setTimestamp();
                            await logChannel.send({ embeds: [embed] }).catch(() => {});
                        }
                    } catch (err) {
                        // Ignora erro se o ban já não existe (10026)
                        if (err.code !== 10026) {
                           console.error(`[MOD MONITOR] Falha ao remover ban de ${ban.user_id}:`, err.message);
                        }
                    } finally {
                        // Remove do DB para não tentar de novo
                        await db.query('DELETE FROM moderation_logs WHERE case_id = $1', [ban.case_id]).catch(() => {});
                    }
                }
            }
        }
    } catch (error) {
        console.error('[MOD MONITOR] Erro fatal:', error);
    }
}

module.exports = { checkExpiredPunishments };