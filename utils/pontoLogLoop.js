// File: utils/pontoLogLoop.js
const db = require('../database.js');
const generateLogUI = require('../ui/pontoLogLive.js');

/**
 * Inicia o loop de atualização dos logs de ponto.
 * Otimizado para Sharding e para prevenir abuso de API e RAM.
 */
function startPontoUpdateLoop(client) {
    console.log("✅ [Ponto] Loop otimizado iniciado (60s).");

    setInterval(async () => {
        try {
            // 1. Busca as sessões ativas
            const activeSessions = await db.query(`
                SELECT * FROM ponto_sessions 
                WHERE status = 'OPEN' 
                AND log_message_id IS NOT NULL 
                AND log_message_id != ''
            `);

            if (activeSessions.rows.length === 0) return;

            // Cache temporário para não buscar as configs da mesma guilda várias vezes no DB no mesmo ciclo
            const guildSettingsCache = new Map();

            // 2. Processa as sessões
            for (const session of activeSessions.rows) {
                try {
                    let channelId = guildSettingsCache.get(session.guild_id);
                    
                    // Se não temos a config da guilda em cache, busca no BD
                    if (!channelId) {
                        const settings = await db.query(
                            'SELECT ponto_canal_registros FROM guild_settings WHERE guild_id = $1',
                            [session.guild_id]
                        );
                        if (settings.rows.length > 0 && settings.rows[0].ponto_canal_registros) {
                            channelId = settings.rows[0].ponto_canal_registros;
                            guildSettingsCache.set(session.guild_id, channelId); // Salva no cache local
                        }
                    }

                    if (!channelId) continue;

                    // AQUI ESTÁ A OTIMIZAÇÃO DE RAM E API:
                    // client.channels.cache.get() apenas olha a RAM, não faz requisição web.
                    const channel = client.channels.cache.get(channelId);
                    if (!channel) continue;

                    // Busca a mensagem (único fetch estritamente necessário)
                    const message = await channel.messages.fetch(session.log_message_id).catch(() => null);
                    if (!message) continue; // Mensagem deletada ou inacessível

                    // Busca o usuário do cache para economizar API
                    let user = client.users.cache.get(session.user_id);
                    // Se o user não estiver na RAM, passamos um objeto genérico para não quebrar a UI
                    if (!user) {
                        user = { id: session.user_id, username: "Usuário", displayAvatarURL: () => null };
                    }

                    // Gera a nova UI
                    const updatedPayload = generateLogUI(session, user);

                    // Edita a mensagem. O próprio Discord ignora a edição se o conteúdo for idêntico.
                    await message.edit(updatedPayload).catch(() => {});

                } catch (innerError) {
                    // Ignora erros de permissão ou rede individuais para não travar o loop inteiro
                    // console.error(`Erro na sessão ${session.session_id}:`, innerError.message);
                }
            }

        } catch (error) {
            console.error("[Ponto Loop] Erro fatal no loop:", error);
        }
    }, 60000); // 60 segundos (Intervalo ideal para grandes servidores)
}

module.exports = { startPontoUpdateLoop };