// Substitua completamente o conteúdo em: handlers/buttons/ticket_close.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const createTranscript = require('../../utils/createTranscript.js');
const generateFeedbackRequester = require('../../ui/ticketFeedbackRequester.js');
const { formatDuration } = require('../../utils/formatDuration.js');

module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        // LÓGICA INTELIGENTE: Identifica o canal principal do ticket,
        // seja ele o canal da interação ou o pai da thread.
        const channelId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
        
        if (!channelId) {
            return interaction.reply({ content: '❌ Erro: Não foi possível identificar o canal principal do ticket.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channelId])).rows[0];
        if (!ticket || ticket.status === 'closed') {
            return interaction.editReply('❌ Ticket não encontrado ou já está fechado.');
        }

        // Marca o ticket como fechado IMEDIATAMENTE para evitar ações duplicadas.
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channelId]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // Define o canal correto para gerar a transcrição
        const transcriptChannel = ticket.is_dm_ticket 
            ? await interaction.guild.channels.fetch(ticket.thread_id).catch(() => null) 
            : interaction.channel;

        if (!transcriptChannel) {
            return interaction.editReply('❌ O canal de origem para a transcrição não foi encontrado.');
        }

        const transcriptBuffer = await createTranscript(transcriptChannel);
        const attachment = new AttachmentBuilder(transcriptBuffer, { name: `transcript-${ticket.channel_id}.html` });

        // LOG EMBED ENRIQUECIDO E UNIFICADO
        if (settings.tickets_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.tickets_canal_logs).catch(() => null);
            if (logChannel) {
                const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
                const claimedBy = ticket.claimed_by ? await interaction.client.users.fetch(ticket.claimed_by).catch(() => null) : null;
                
                const creationTimestamp = (BigInt(ticket.channel_id) >> 22n) + 1420070400000n;
                const durationMs = Date.now() - Number(creationTimestamp);

                const logEmbed = new EmbedBuilder()
                    .setColor('Orange')
                    .setTitle(ticket.is_dm_ticket ? '📄 Atendimento via DM Finalizado' : `📄 Ticket #${ticket.ticket_number} Finalizado`)
                    .setAuthor({ name: user?.tag || 'Usuário Desconhecido', iconURL: user?.displayAvatarURL() })
                    .setThumbnail(user?.displayAvatarURL() || null)
                    .addFields(
                        { name: 'Cliente', value: user ? `${user}` : '`Não encontrado`', inline: true },
                        { name: 'Atendente', value: claimedBy ? `${claimedBy}` : '`Ninguém assumiu`', inline: true },
                        { name: 'Finalizado por', value: `${interaction.user}`, inline: true },
                        { name: 'ID do Canal', value: `\`${ticket.channel_id}\``, inline: false},
                        { name: 'Duração Total', value: `\`${formatDuration(durationMs)}\``, inline: false },
                        { name: 'Histórico de Ações', value: ticket.action_log ? ticket.action_log.substring(0, 1024) : 'Nenhuma ação registrada.' }
                    )
                    .setTimestamp();
                
                // MANTIDO: Envia o arquivo para o canal de logs
                await logChannel.send({ embeds: [logEmbed], files: [attachment] });
            }
        }
        
        // Envio de notificação e transcrição para o usuário
        const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
        if (user) {
            await user.send(`Seu atendimento no servidor **${interaction.guild.name}** foi finalizado.`).catch(() => {});
            if (settings.tickets_feedback_enabled) {
                await user.send(generateFeedbackRequester(ticket)).catch(() => {});
            }
            // REMOVIDO: A linha que enviava o "attachment" para o usuário foi apagada aqui.
        }
        
        // Lógica de exclusão correta
        setTimeout(() => {
            const channelToDelete = ticket.is_dm_ticket ? transcriptChannel.parent : transcriptChannel;
            if (channelToDelete) {
                channelToDelete.delete('Ticket finalizado.').catch(err => console.error(`Falha ao deletar canal/thread ${channelToDelete.id}:`, err));
            }
        }, 10000);

        await interaction.editReply('✅ Atendimento finalizado com sucesso!');
    }
};