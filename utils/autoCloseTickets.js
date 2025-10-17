// Caminho: utils/autoCloseTickets.js
const db = require('../database.js');
const { closeTicket } = require('./closeTicket.js'); // Assumindo que a lógica de fechar foi movida para seu próprio utilitário

async function checkAndCloseInactiveTickets(client) {
    console.log('[Auto-Close] Verificando tickets inativos...');
    await db.withClient(async (dbClient) => { // <-- USA withClient
        try {
            const guildsWithAutoClose = (await dbClient.query('SELECT * FROM guild_settings WHERE tickets_autoclose_enabled = true')).rows;

            for (const settings of guildsWithAutoClose) {
                const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
                if (!guild) continue;
                
                // Lógica de avisar e fechar tickets...
                const ticketsToWarn = (await dbClient.query(
                    `SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' AND warning_sent_at IS NULL AND last_message_at < NOW() - INTERVAL '1 hour' * $2`,
                    [settings.guild_id, settings.tickets_autoclose_hours]
                )).rows;

                for (const ticket of ticketsToWarn) {
                    const channel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
                    if (channel) {
                        // ... envia o aviso
                        await dbClient.query('UPDATE tickets SET warning_sent_at = NOW() WHERE channel_id = $1', [ticket.channel_id]);
                    }
                }

                const ticketsToClose = (await dbClient.query(
                    `SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' AND warning_sent_at IS NOT NULL AND warning_sent_at < NOW() - INTERVAL '15 minutes'`,
                    [settings.guild_id]
                )).rows;

                for (const ticket of ticketsToClose) {
                     // A função closeTicket deve usar db.query simples, pois é chamada uma vez por ticket
                    closeTicket(client, ticket.channel_id, client.user, 'Inatividade').catch(err => console.error(err));
                }
            }
        } catch (error) {
            console.error('[Auto-Close] Erro durante a verificação de tickets inativos:', error);
        }
    });
}

module.exports = { checkAndCloseInactiveTickets };