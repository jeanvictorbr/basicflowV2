// Crie em: utils/autoCloseTickets.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database.js');

async function closeTicket(client, guild, channel, settings, closer, reason) {
    try {
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id])).rows[0];
        if (!ticket || ticket.status === 'closed') return;

        const opener = await guild.members.fetch(ticket.user_id).catch(() => null);

        // Transcrição
        const messages = await channel.messages.fetch({ limit: 100 });
        const transcriptText = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString('pt-BR')}] ${m.author.tag}: ${m.content}`).join('\n');
        const transcriptFile = new AttachmentBuilder(Buffer.from(transcriptText), { name: `transcript-${channel.name}.txt` });

        // Envio do Log
        if (settings.tickets_canal_logs) {
            const logChannel = await guild.channels.fetch(settings.tickets_canal_logs).catch(() => null);
            if (logChannel) {
                const finalActionLog = ticket.action_log + `> Ticket finalizado por ${closer}.\n> Motivo: ${reason}\n`;
                const logEmbed = new EmbedBuilder()
                    .setColor('Orange').setTitle('📄 Transcrição de Ticket Finalizado')
                    .setAuthor({ name: opener?.user.tag || `ID: ${ticket.user_id}`, iconURL: opener?.user.displayAvatarURL() })
                    .addFields(
                        { name: 'Ticket ID', value: `\`#${String(ticket.ticket_number).padStart(4, '0')}\``, inline: true },
                        { name: 'Aberto por', value: opener ? `${opener}` : '`Usuário saiu`', inline: true },
                        { name: 'Fechado por', value: `${closer}`, inline: true },
                        { name: 'Histórico de Ações', value: finalActionLog.substring(0, 1024) }
                    ).setTimestamp();
                await logChannel.send({ embeds: [logEmbed], files: [transcriptFile] });
            }
        }
        
        // Notificar o usuário por DM, se aplicável
        if (settings.tickets_autoclose_dm_user && opener) {
            await opener.send(`Olá! Seu ticket \`#${String(ticket.ticket_number).padStart(4, '0')}\` no servidor **${guild.name}** foi fechado automaticamente por inatividade. Se ainda precisar de ajuda, sinta-se à vontade para abrir um novo.`).catch(() => {});
        }

        // Deletar o canal
        await channel.delete('Ticket fechado por inatividade.');
        
        // Atualizar o DB (sem deletar a linha para manter o histórico)
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channel.id]);

    } catch (error) {
        console.error(`[Auto-Close] Falha ao fechar o ticket #${channel.name} no servidor ${guild.name}:`, error);
    }
}


async function checkAndCloseInactiveTickets(client) {
    console.log('[Auto-Close] Verificando tickets inativos...');
    try {
        const guildsWithAutoClose = (await db.query('SELECT * FROM guild_settings WHERE tickets_autoclose_enabled = true')).rows;

        for (const settings of guildsWithAutoClose) {
            const guild = await client.guilds.fetch(settings.guild_id).catch(() => null);
            if (!guild) continue;
            
            const inactiveTickets = (await db.query(
                `SELECT * FROM tickets WHERE guild_id = $1 AND status = 'open' AND last_message_at < NOW() - INTERVAL '${settings.tickets_autoclose_hours} hours'`,
                [settings.guild_id]
            )).rows;

            if (inactiveTickets.length > 0) {
                console.log(`[Auto-Close] Encontrado(s) ${inactiveTickets.length} ticket(s) inativo(s) no servidor ${guild.name}.`);
            }

            for (const ticket of inactiveTickets) {
                const channel = await guild.channels.fetch(ticket.channel_id).catch(() => null);
                if (channel) {
                    await closeTicket(client, guild, channel, settings, client.user, 'Inatividade');
                } else {
                    // Se o canal não existe mais, apenas atualiza o status no DB
                    await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [ticket.channel_id]);
                }
            }
        }
    } catch (error) {
        console.error('[Auto-Close] Erro durante a verificação de tickets inativos:', error);
    }
}

module.exports = { checkAndCloseInactiveTickets };