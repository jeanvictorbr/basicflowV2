const db = require('../database.js');
const generateLogUI = require('../ui/pontoLogLive.js');

/**
 * Inicia o loop de atualização dos logs de ponto.
 * Deve ser chamado UMA VEZ no index.js (evento ready).
 */
function startPontoUpdateLoop(client) {
    console.log("✅ [Ponto] Loop de atualização Live Log iniciado (15s).");

    setInterval(async () => {
        try {
            // 1. Busca todas as sessões ABERTAS que têm um log_message_id registrado
            // Filtra apenas status 'OPEN' e não pausadas (opcional: pode atualizar pausadas também se quiser mostrar o tempo parado)
            const activeSessions = await db.query(`
                SELECT * FROM ponto_sessions 
                WHERE status = 'OPEN' 
                AND log_message_id IS NOT NULL 
                AND log_message_id != ''
            `);

            if (activeSessions.rows.length === 0) return;

            // 2. Itera sobre as sessões e atualiza
            for (const session of activeSessions.rows) {
                // Se estiver pausado, não precisa atualizar o relógio a cada 15s (economia de API), 
                // a menos que você queira forçar a garantia visual. Vamos atualizar sempre para garantir.
                
                try {
                    // Precisamos do canal configurado para esta guild
                    const settings = await db.query(
                        'SELECT ponto_canal_registros FROM guild_settings WHERE guild_id = $1',
                        [session.guild_id]
                    );

                    if (settings.rows.length === 0 || !settings.rows[0].ponto_canal_registros) continue;

                    const channelId = settings.rows[0].ponto_canal_registros;
                    const channel = await client.channels.fetch(channelId).catch(() => null);
                    
                    if (!channel) continue;

                    const message = await channel.messages.fetch(session.log_message_id).catch(() => null);
                    if (!message) continue; // Mensagem deletada

                    // Busca o usuário para pegar avatar/nome atualizados
                    const user = await client.users.fetch(session.user_id).catch(() => null);
                    if (!user) continue;

                    // Gera a UI nova com o tempo atualizado
                    const updatedPayload = generateLogUI(session, user);

                    // Edita a mensagem (Discord ignora se o conteúdo for idêntico, economizando API)
                    await message.edit(updatedPayload);

                } catch (innerError) {
                    // Ignora erros individuais para não travar o loop (ex: permissão, rate limit)
                    // console.error(`Erro ao atualizar sessão ${session.session_id}:`, innerError.message);
                }
            }

        } catch (error) {
            console.error("[Ponto Loop] Erro fatal no loop:", error);
        }
    }, 15000); // 15 Segundos
}

module.exports = { startPontoUpdateLoop };