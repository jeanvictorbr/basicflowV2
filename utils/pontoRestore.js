// File: utils/pontoRestore.js
const db = require('../database.js');
const generatePontoDashboard = require('../ui/pontoDashboardPessoal.js');
const generatePontoDashboardV2 = require('../ui/pontoDashboardPessoalV2.js');

const V2_FLAG = 1 << 15;

module.exports = async (client) => {
    console.log('[PontoRestore] ✅ Loop Global de Dashboards Pessoais iniciado (60s).');

    // Substituímos 2.452 intervalos por APENAS UM intervalo global.
    setInterval(async () => {
        try {
            // Busca apenas sessões ativas que possuem um painel pessoal renderizado
            const activeSessions = await db.query(`
                SELECT * FROM ponto_sessions 
                WHERE is_paused = false 
                AND dashboard_message_id IS NOT NULL 
                AND dashboard_message_id != ''
            `);

            if (activeSessions.rows.length === 0) return;

            // Cache para não sobrecarregar o banco de dados com a mesma guilda
            const guildSettingsCache = new Map();

            for (const session of activeSessions.rows) {
                try {
                    let settings = guildSettingsCache.get(session.guild_id);
                    
                    if (!settings) {
                        const res = await db.query('SELECT ponto_canal_registros, ponto_dashboard_v2_enabled FROM guild_settings WHERE guild_id = $1', [session.guild_id]);
                        settings = res.rows[0];
                        if (settings) guildSettingsCache.set(session.guild_id, settings);
                    }

                    if (!settings || !settings.ponto_canal_registros) continue;

                    // OTIMIZAÇÃO: Busca no cache da RAM, sem usar a API do Discord
                    const channel = client.channels.cache.get(settings.ponto_canal_registros);
                    if (!channel) continue;

                    // Único fetch necessário (para a mensagem específica)
                    const msg = await channel.messages.fetch(session.dashboard_message_id).catch(() => null);
                    if (!msg) continue;

                    // Busca os dados do usuário do cache
                    let user = client.users.cache.get(session.user_id);
                    if (!user) user = { id: session.user_id, displayAvatarURL: () => '' }; // Fallback seguro

                    // Reconstrói o mockInteraction para o gerador de UI sem abusar da API
                    const mockInteraction = {
                        user: user,
                        member: channel.guild.members.cache.get(session.user_id) || null,
                        guild: channel.guild,
                        client: client
                    };

                    const useV2 = settings.ponto_dashboard_v2_enabled;
                    const payload = useV2 
                        ? { components: generatePontoDashboardV2(mockInteraction, settings, session), flags: V2_FLAG } 
                        : generatePontoDashboard(mockInteraction, session);

                    // Atualiza o painel do usuário
                    await msg.edit(payload).catch(() => {});

                } catch (innerErr) {
                    // Ignora erros individuais silenciosamente
                }
            }
        } catch (error) {
            console.error('[PontoRestore] Erro crítico no loop global:', error);
        }
    }, 60000); // 60 segundos - Carga perfeitamente distribuída e leve
};