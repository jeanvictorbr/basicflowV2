const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const createTranscript = require('./createTranscript.js');

/**
 * Função interna para fechar um ticket, gerar transcrição e enviar logs.
 * Esta função é chamada pela tarefa principal.
 */
async function closeTicket(client, guild, channel, settings, closer, reason) {
    try {
        const ticketResult = await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id]);
        const ticket = ticketResult.rows[0];

        // Se o ticket não existe ou já foi fechado, não faz nada.
        if (!ticket || ticket.status === 'closed') {
            return;
        }

        const opener = await guild.members.fetch(ticket.user_id).catch(() => null);
        const transcriptBuffer = await createTranscript(channel);
        const attachment = new AttachmentBuilder(transcriptBuffer, { name: `transcript-${channel.name}.html` });

        // Envia o log de transcrição, se configurado
        if (settings.tickets_canal_logs) {
            const logChannel = await guild.channels.fetch(settings.tickets_canal_logs).catch(() => null);
            if (logChannel) {
                const finalActionLog = (ticket.action_log || '') + `> Ticket finalizado por ${closer}.\n> Motivo: ${reason}\n`;
                const logEmbed = new EmbedBuilder()
                    .setColor('Orange')
                    .setTitle('📄 Transcrição de Ticket Finalizado')
                    .setAuthor({ name: opener?.user.tag || `ID: ${ticket.user_id}`, iconURL: opener?.user.displayAvatarURL() })
                    .addFields(
                        { name: 'Ticket ID', value: `\`#${String(ticket.ticket_number).padStart(4, '0')}\``, inline: true },
                        { name: 'Aberto por', value: opener ? `${opener}` : '`Usuário saiu`', inline: true },
                        { name: 'Fechado por', value: `${closer}`, inline: true },
                        { name: 'Histórico de Ações', value: finalActionLog.substring(0, 1024) }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            }
        }
        
        // Notifica o usuário na DM sobre o fechamento por inatividade, se configurado
        if (settings.tickets_autoclose_dm_user && opener && (reason === 'Inatividade' || reason.includes('Inatividade'))) {
            await opener.send(`Olá! Seu ticket \`#${String(ticket.ticket_number).padStart(4, '0')}\` no servidor **${guild.name}** foi fechado automaticamente por inatividade. Se ainda precisar de ajuda, pode abrir um novo.`).catch(() => {});
        }

        // Deleta o canal e atualiza o status no banco de dados
        await channel.delete(`Ticket fechado: ${reason}`);
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channel.id]);

    } catch (error) {
        console.error(`[Auto-Close] Falha ao fechar o ticket #${channel.name} no servidor ${guild.name}:`, error);
        // Se a falha foi ao deletar o canal (ex: permissão), ainda marca como fechado para evitar loops
        if (error.code === 50013) { // Missing Permissions
            await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channel.id]);
        }
    }
}

/**
 * Tarefa principal que verifica e fecha tickets inativos.
 * É esta função que é chamada pelo setInterval no index.js.
 */
async function checkAndCloseInactiveTickets(client) {
    console.log('[Auto-Close] Verificando tickets inativos...');
    const dbClient = await db.getClient(); // Pega um cliente do pool
    try {
        const guildsWithAutoClose = (await dbClient.query('SELECT * FROM guild_settings WHERE tickets_autoclose_enabled = true')).rows;

        for (const settings of guildsWithAutoClose) {
            const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
            if (!guild) continue;

            const warnUserInTicket = settings.tickets_autoclose_warn_user !== false;

            if (warnUserInTicket) {
                // Etapa 1: Fechar tickets que já foram avisados há 15 minutos
                const ticketsToClose = (await dbClient.query(
                    `SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' AND warning_sent_at IS NOT NULL AND warning_sent_at < NOW() - INTERVAL '15 minutes'`,
                    [settings.guild_id]
                )).rows;

                for (const ticket of ticketsToClose) {
                    const channel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
                    if (channel) {
                        await closeTicket(client, guild, channel, settings, client.user, 'Inatividade');
                    } else {
                        // Se o canal não existe mais, apenas atualiza o DB
                        await dbClient.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [ticket.channel_id]);
                    }
                }

                // Etapa 2: Avisar tickets que estão prestes a expirar
                const ticketsToWarn = (await dbClient.query(
                    `SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' AND warning_sent_at IS NULL AND last_message_at < NOW() - INTERVAL '${settings.tickets_autoclose_hours} hours'`,
                    [settings.guild_id]
                )).rows;

                for (const ticket of ticketsToWarn) {
                    const channel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
                    if (channel) {
                        const warningMessage = `Olá <@${ticket.user_id}>, este ticket não recebe uma nova mensagem há mais de **${settings.tickets_autoclose_hours} horas**.\n\nEle será fechado por inatividade em **15 minutos**. Para cancelar o fechamento, por favor, envie qualquer mensagem neste canal.`;
                        await channel.send(warningMessage);
                        await dbClient.query('UPDATE tickets SET warning_sent_at = NOW() WHERE channel_id = $1', [ticket.channel_id]);
                    }
                }
            } else {
                // Lógica para fechar diretamente, sem aviso prévio
                const inactiveTickets = (await dbClient.query(
                    `SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' AND last_message_at < NOW() - INTERVAL '${settings.tickets_autoclose_hours} hours'`,
                    [settings.guild_id]
                )).rows;
                
                for (const ticket of inactiveTickets) {
                    const channel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
                    if (channel) {
                        await closeTicket(client, guild, channel, settings, client.user, 'Inatividade (Aviso Desativado)');
                    } else {
                        await dbClient.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [ticket.channel_id]);
                    }
                }
            }
        }
    } catch (error) {
        console.error('[Auto-Close] Erro durante a verificação de tickets inativos:', error);
    } finally {
        // ESSENCIAL: Garante que a conexão seja liberada de volta para o pool, não importa o que aconteça.
        if (dbClient) {
            dbClient.release();
        }
    }
}

module.exports = { checkAndCloseInactiveTickets };