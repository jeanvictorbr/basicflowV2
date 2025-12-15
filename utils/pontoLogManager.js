const db = require('../database.js');
const generateLogUI = require('../ui/pontoLogLive.js');

/**
 * Gerencia a criação e atualização do Log de Ponto "Live"
 * @param {Object} client O cliente do Discord
 * @param {Object} session O objeto da sessão do banco de dados
 * @param {Object} user O objeto User ou Member do Discord
 */
async function updatePontoLog(client, session, user) {
    try {
        // 1. Busca configuração do canal de logs
        const configResult = await db.query(
            `SELECT ponto_canal_registros FROM guild_settings WHERE guild_id = $1`,
            [session.guild_id]
        );

        if (configResult.rows.length === 0 || !configResult.rows[0].ponto_canal_registros) {
            return; // Sistema de logs não configurado neste servidor
        }

        const logChannelId = configResult.rows[0].ponto_canal_registros;
        const channel = await client.channels.fetch(logChannelId).catch(() => null);

        if (!channel) return; // Canal não existe mais ou sem permissão

        const logPayload = generateLogUI(session, user);

        // 2. Verifica se já existe uma mensagem de log para esta sessão
        if (session.log_message_id) {
            // Tenta editar a mensagem existente
            try {
                const message = await channel.messages.fetch(session.log_message_id);
                if (message) {
                    await message.edit(logPayload);
                    return; // Sucesso na edição
                }
            } catch (err) {
                // Se der erro (ex: mensagem deletada manualmente), prossegue para criar uma nova
                console.log("Mensagem de log antiga não encontrada, criando nova...");
            }
        }

        // 3. Se não existe ou falhou ao editar, cria nova mensagem
        const newMessage = await channel.send(logPayload);

        // 4. Salva o ID da nova mensagem na sessão para futuras edições
        await db.query(
            `UPDATE ponto_sessions SET log_message_id = $1 WHERE session_id = $2`,
            [newMessage.id, session.session_id]
        );

    } catch (error) {
        console.error("Erro ao atualizar Log de Ponto:", error);
    }
}

module.exports = { updatePontoLog };