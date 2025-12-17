// Local: utils/purgeMonitor.js
const CronJob = require('cron').CronJob;
const { EmbedBuilder } = require('discord.js'); // Importação correta no topo

/**
 * Inicia o monitor de Auto-Purge.
 * @param {object} client - O cliente do Discord.js.
 * @param {object} db - A conexão com o banco de dados.
 */
function startPurgeMonitor(client, db) {
    // Cron: 0 segundos, a cada 5 minutos (0 */5 * * * *)
    const job = new CronJob('0 */5 * * * *', async function () {
        console.log('[Auto-Purge] Iniciando verificação de canais (Ciclo de 5min)...');
        
        try {
            // Busca todos os configs ativos no banco
            const configs = await db.query('SELECT * FROM guild_aut_purge WHERE enabled = TRUE');

            for (const config of configs.rows) {
                try {
                    const guild = await client.guilds.fetch(config.guild_id).catch(() => null);
                    if (!guild) continue;

                    const channel = await guild.channels.fetch(config.channel_id).catch(() => null);
                    if (!channel || !channel.isTextBased()) continue;

                    // Converter o valor do banco para Float
                    const hours = parseFloat(config.max_age_hours);

                    // Calcular o timestamp de corte
                    const cutoffDate = Date.now() - (hours * 60 * 60 * 1000);

                    // Buscar mensagens (limitado a 100 por ciclo)
                    const messages = await channel.messages.fetch({ limit: 100 });
                    
                    // Filtrar mensagens para deletar
                    const messagesToDelete = messages.filter(m => 
                        m.createdTimestamp < cutoffDate && 
                        !m.pinned && 
                        !m.system
                    );

                    if (messagesToDelete.size > 0) {
                        // Bulk Delete
                        const deleted = await channel.bulkDelete(messagesToDelete, true).catch(err => {
                            // Ignorar erro de permissão ou canal desconhecido no console
                            if (err.code !== 50013 && err.code !== 10003) {
                                console.error(`[Auto-Purge] Erro ao deletar em ${channel.id}:`, err);
                            }
                            return new Map();
                        });

                        if (deleted.size > 0) {
                            // --- Formatação do Tempo ---
                            let durationText;
                            if (hours < 1) {
                                durationText = `${Math.round(hours * 60)} minutos`;
                            } else if (hours >= 24 && hours % 24 === 0) {
                                durationText = `${hours / 24} dias`;
                            } else {
                                durationText = `${parseFloat(hours.toFixed(2))} horas`;
                            }

                            // --- Construção do Embed ---
                            const embed = new EmbedBuilder()
                                .setTitle('🧹 Limpeza Automática')
                                .setDescription(`O sistema removeu **${deleted.size}** mensagens antigas para manter o canal limpo.`)
                                .setColor('#5865F2')
                                .addFields({
                                    name: 'Critério de Retenção',
                                    value: `Mensagens com mais de **${durationText}**.`,
                                    inline: true
                                })
                                .setFooter({ text: 'Koda Auto-Purge System' })
                                .setTimestamp();

                            // --- Envio com Log de Erro ---
                            channel.send({ embeds: [embed] })
                                .then(msg => {
                                    // Apaga o aviso após 20 segundos

                                })
                                .catch(err => {
                                    console.error(`[Auto-Purge] ERRO AO ENVIAR EMBED no canal ${channel.name}:`, err.message);
                                    // Fallback: Tenta enviar mensagem de texto simples se o Embed falhar (ex: falta de permissão de links)
                                    if (err.code === 50013) { // Missing Permissions
                                        channel.send(`🧹 **Limpeza Automática:** Removidas ${deleted.size} mensagens antigas (> ${durationText}).`).catch(() => {});
                                    }
                                });
                            
                            console.log(`[Auto-Purge] Limpou ${deleted.size} msgs no canal ${channel.name} (${guild.name})`);
                        }
                    }

                } catch (err) {
                    // Erros pontuais não param o loop
                    // console.error(`[Auto-Purge] Erro no canal ${config.channel_id}:`, err.message);
                }
            }
        } catch (err) {
            console.error('[Auto-Purge] Erro fatal no monitor:', err);
        }
    });

    job.start();
    console.log('✅ Monitor de Auto-Purge iniciado (Intervalo: 5m).');
}

module.exports = { startPurgeMonitor };