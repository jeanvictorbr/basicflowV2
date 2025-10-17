// Crie este novo arquivo em: utils/closeTicket.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const createTranscript = require('./createTranscript.js');

async function closeTicket(client, channelId, closer, reason) {
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) {
        // Se o canal não existe, apenas atualiza o status no DB para evitar loops
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channelId]);
        return;
    }

    const guild = channel.guild;

    try {
        const settingsResult = await db.query('SELECT tickets_canal_logs, tickets_autoclose_dm_user FROM guild_settings WHERE guild_id = $1', [guild.id]);
        const settings = settingsResult.rows[0] || {};
        
        const ticketResult = await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channel.id]);
        const ticket = ticketResult.rows[0];

        if (!ticket || ticket.status === 'closed') {
            return;
        }

        const opener = await guild.members.fetch(ticket.user_id).catch(() => null);
        const transcriptBuffer = await createTranscript(channel);
        const attachment = new AttachmentBuilder(transcriptBuffer, { name: `transcript-${channel.name}.html` });

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
        
        if (settings.tickets_autoclose_dm_user && opener && reason === 'Inatividade') {
            await opener.send(`Olá! Seu ticket \`#${String(ticket.ticket_number).padStart(4, '0')}\` no servidor **${guild.name}** foi fechado automaticamente por inatividade. Se ainda precisar de ajuda, pode abrir um novo.`).catch(() => {});
        }

        await channel.delete(`Ticket fechado: ${reason}`);
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channel.id]);

    } catch (error) {
        console.error(`[Close Ticket] Falha ao fechar o ticket #${channel.name} no servidor ${guild.name}:`, error);
        // Se o erro for falta de permissão, o ticket já não pode ser acessado, então apenas o marcamos como fechado.
        if (error.code === 50013 || error.code === 10003) { // Missing Access or Unknown Channel
            await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channel.id]);
        }
    }
}

module.exports = { closeTicket };