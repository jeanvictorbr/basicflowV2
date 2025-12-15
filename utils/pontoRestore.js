// utils/pontoRestore.js
const db = require('../database.js');
const generatePontoDashboard = require('../ui/pontoDashboardPessoal.js');
const generatePontoDashboardV2 = require('../ui/pontoDashboardPessoalV2.js');

const V2_FLAG = 1 << 15;

module.exports = async (client) => {
    try {
        console.log('[PontoRestore] 🔄 Verificando sessões de ponto ativas...');
        const activeSessions = await db.query("SELECT * FROM ponto_sessions WHERE is_paused = false");

        if (activeSessions.rows.length === 0) {
            console.log('[PontoRestore] ✅ Nenhuma sessão ativa encontrada.');
            return;
        }

        console.log(`[PontoRestore] ⏳ Restaurando ${activeSessions.rows.length} sessões...`);

        for (const session of activeSessions.rows) {
            // Tenta obter as configurações da guilda dessa sessão
            const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [session.guild_id])).rows[0];
            if (!settings) continue;

            // Recria o intervalo de atualização
            const interval = setInterval(async () => {
                // Verifica se a sessão ainda existe e está ativa
                const currentSession = (await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [session.session_id])).rows[0];
                
                // Se foi deletada ou pausada, para o relógio
                if (!currentSession || currentSession.is_paused) {
                    if (client.pontoIntervals.has(session.user_id)) {
                        clearInterval(client.pontoIntervals.get(session.user_id));
                        client.pontoIntervals.delete(session.user_id);
                    }
                    return;
                }

                try {
                    const channel = await client.channels.fetch(settings.ponto_canal_registros).catch(() => null);
                    if (!channel) return;

                    if (currentSession.dashboard_message_id) {
                        const msg = await channel.messages.fetch(currentSession.dashboard_message_id).catch(() => null);
                        if (msg) {
                            // Reconstrói o objeto "interação" fake para o gerador de UI funcionar
                            const member = await channel.guild.members.fetch(currentSession.user_id).catch(() => null);
                            const mockInteraction = {
                                user: member ? member.user : { id: currentSession.user_id, displayAvatarURL: () => '' },
                                member: member,
                                guild: channel.guild,
                                client: client
                            };

                            const useV2 = settings.ponto_dashboard_v2_enabled;
                            const payload = useV2 
                                ? { components: generatePontoDashboardV2(mockInteraction, settings, currentSession), flags: V2_FLAG } 
                                : generatePontoDashboard(mockInteraction, currentSession);

                            await msg.edit(payload).catch(err => {
                                // Se a mensagem foi deletada (Unknown Message), para o intervalo
                                if (err.code === 10008) {
                                    clearInterval(client.pontoIntervals.get(session.user_id));
                                    client.pontoIntervals.delete(session.user_id);
                                }
                            });
                        }
                    }
                } catch (err) {
                    // Erros silenciosos para não spammar console
                }
            }, 10000); // 10 segundos

            // Salva o intervalo na memória do bot
            client.pontoIntervals.set(session.user_id, interval);
        }
        console.log('[PontoRestore] ✅ Sessões restauradas com sucesso.');

    } catch (error) {
        console.error('[PontoRestore] ❌ Erro crítico ao restaurar sessões:', error);
    }
};