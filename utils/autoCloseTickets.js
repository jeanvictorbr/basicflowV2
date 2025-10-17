// Substitua o conteúdo em: utils/autoCloseTickets.js
const db = require('../database.js');
const { closeTicket } = require('./closeTicket.js'); // Caminho correto para o novo arquivo

async function checkAndCloseInactiveTickets(client) {
    console.log('[Auto-Close] Verificando tickets inativos...');
    // Usamos withClient para garantir que a conexão principal do loop seja sempre fechada
    await db.withClient(async (dbClient) => {
        try {
            const guildsWithAutoClose = (await dbClient.query('SELECT * FROM guild_settings WHERE tickets_autoclose_enabled = true')).rows;

            for (const settings of guildsWithAutoClose) {
                const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
                if (!guild) continue;

                const warnUserInTicket = settings.tickets_autoclose_warn_user !== false;
                const autoCloseHours = settings.tickets_autoclose_hours || 24;

                if (warnUserInTicket) {
                    // Primeiro, fecha tickets que já foram avisados
                    const ticketsToClose = (await dbClient.query(
                        `SELECT channel_id FROM tickets WHERE guild_id = $1 AND status = 'open' AND warning_sent_at IS NOT NULL AND warning_sent_at < NOW() - INTERVAL '15 minutes'`,
                        [settings.guild_id]
                    )).rows;

                    for (const ticket of ticketsToClose) {
                        closeTicket(client, ticket.channel_id, client.user, 'Inatividade').catch(err => console.error(`[Auto-Close] Erro ao tentar fechar ticket ${ticket.channel_id}:`, err));
                    }
                    
                    // Depois, avisa tickets que estão inativos mas ainda não foram avisados
                    const ticketsToWarn = (await dbClient.query(
                        `SELECT user_id, channel_id FROM tickets WHERE guild_id = $1 AND status = 'open' AND warning_sent_at IS NULL AND last_message_at < NOW() - INTERVAL '1 hour' * $2`,
                        [settings.guild_id, autoCloseHours]
                    )).rows;

                    for (const ticket of ticketsToWarn) {
                        const channel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
                        if (channel) {
                            const warningMessage = `Olá <@${ticket.user_id}>, este ticket não recebe uma nova mensagem há mais de **${autoCloseHours} horas**.\n\nEle será fechado por inatividade em **15 minutos**. Para cancelar o fechamento, por favor, envie qualquer mensagem neste canal.`;
                            await channel.send(warningMessage).catch(() => {});
                            await dbClient.query('UPDATE tickets SET warning_sent_at = NOW() WHERE channel_id = $1', [ticket.channel_id]);
                        }
                    }
                } else { // Se a opção de aviso está desativada, fecha direto
                    const inactiveTickets = (await dbClient.query(
                        `SELECT channel_id FROM tickets WHERE guild_id = $1 AND status = 'open' AND last_message_at < NOW() - INTERVAL '1 hour' * $2`,
                        [settings.guild_id, autoCloseHours]
                    )).rows;
                    
                    for (const ticket of inactiveTickets) {
                        closeTicket(client, ticket.channel_id, client.user, 'Inatividade (Aviso Desativado)').catch(err => console.error(`[Auto-Close] Erro ao tentar fechar ticket ${ticket.channel_id}:`, err));
                    }
                }
            }
        } catch (error) {
            console.error('[Auto-Close] Erro durante a verificação de tickets inativos:', error);
        }
    }); // O cliente é liberado automaticamente aqui
}

module.exports = { checkAndCloseInactiveTickets };