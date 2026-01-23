const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const createTranscript = require('../../utils/createTranscript.js');
const generateFeedbackRequester = require('../../ui/ticketFeedbackRequester.js');
const { formatDuration } = require('../../utils/formatDuration.js');

module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        // 1. Identificar o ID do Ticket
        const channelId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
        
        if (!channelId) {
            return interaction.reply({ content: '❌ Erro: Canal principal não identificado.', ephemeral: true }).catch(() => {});
        }

        // 2. Deferir (Pensando...)
        try {
            if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });
        } catch (e) {
            return; 
        }

        // 3. Buscar Ticket no Banco
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channelId])).rows[0];
        if (!ticket || ticket.status === 'closed') {
            return interaction.editReply('❌ Ticket não encontrado ou já está fechado.').catch(() => {});
        }

        // 4. Marcar como fechado
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channelId]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // 5. Definir canal do Transcript
        let transcriptChannel = interaction.channel;
        if (ticket.is_dm_ticket) {
            transcriptChannel = await interaction.guild.channels.fetch(ticket.thread_id).catch(() => null);
        }

        if (!transcriptChannel) {
            return interaction.editReply('⚠️ Canal do ticket não encontrado. Fechado no banco.').catch(() => {});
        }

        // 6. Gerar Transcript (COM PROTEÇÃO)
        let attachment = null;
        let transcriptBuffer = null;

        try {
            transcriptBuffer = await createTranscript(transcriptChannel, interaction.guild);
            if (transcriptBuffer) {
                attachment = new AttachmentBuilder(transcriptBuffer, { name: `transcript-${ticket.channel_id}.html` });
            }
        } catch (err) {
            console.error('[Ticket Close] Erro no transcript:', err);
        }

        // 7. ENVIO DE LOGS (CORRIGIDO)
        // O erro estava aqui: usava nome errado da variável. Agora verificamos os dois.
        const logChannelId = settings.tickets_canal_logs || settings.tickets_log_channel;

        if (logChannelId) {
            try {
                const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
                
                if (logChannel) {
                    const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
                    const claimedBy = ticket.claimed_by ? await interaction.client.users.fetch(ticket.claimed_by).catch(() => null) : null;
                    
                    let durationMs = 0;
                    try {
                        const creationTimestamp = (BigInt(ticket.channel_id) >> 22n) + 1420070400000n;
                        durationMs = Date.now() - Number(creationTimestamp);
                    } catch (e) {}

                    const logEmbed = new EmbedBuilder()
                        .setColor('Orange')
                        .setTitle(ticket.is_dm_ticket ? '📄 Atendimento via DM Finalizado' : `📄 Ticket #${ticket.ticket_number || 'N/A'} Finalizado`)
                        .setAuthor({ name: user?.tag || 'Usuário Desconhecido', iconURL: user?.displayAvatarURL() })
                        .addFields(
                            { name: 'Cliente', value: user ? `${user}` : '`Saiu do Servidor`', inline: true },
                            { name: 'Atendente', value: claimedBy ? `${claimedBy}` : '`Ninguém assumiu`', inline: true },
                            { name: 'Fechado por', value: `${interaction.user}`, inline: true },
                            { name: 'ID do Canal', value: `\`${ticket.channel_id}\``, inline: false},
                            { name: 'Duração', value: `\`${formatDuration(durationMs)}\``, inline: true },
                        )
                        .setTimestamp();

                    // Prepara o envio com ou sem arquivo
                    const payload = { embeds: [logEmbed] };
                    if (attachment) {
                        payload.files = [attachment];
                    } else {
                        logEmbed.setFooter({ text: '⚠️ Transcript não gerado (Erro ou Vazio)' });
                    }

                    await logChannel.send(payload);
                }
            } catch (err) {
                console.error('[Ticket Log] Falha ao enviar log:', err.message);
            }
        }
        
        // 8. ENVIO PARA O USUÁRIO (Privado)
        // Restaurada a lógica de enviar o arquivo pro usuário também
        const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
        if (user) {
            const userPayload = { content: `Seu atendimento no servidor **${interaction.guild.name}** foi finalizado.` };
            
            // Só anexa se o arquivo existir e for válido
            if (attachment) {
                userPayload.files = [attachment];
            }

            await user.send(userPayload).catch(() => {});
            
            if (settings.tickets_feedback_enabled) {
                try {
                    const feedbackMsg = generateFeedbackRequester(ticket);
                    if(feedbackMsg) await user.send(feedbackMsg).catch(() => {});
                } catch(e) {}
            }
        }
        
        // 9. Deletar Canal (Com Delay de segurança)
        setTimeout(async () => {
            try {
                const channelToDelete = ticket.is_dm_ticket ? transcriptChannel : transcriptChannel; 
                if (channelToDelete) {
                    await channelToDelete.delete('Ticket finalizado.').catch(err => {
                        if (err.code !== 10003) console.error(`Falha ao deletar canal:`, err.message);
                    });
                }
            } catch (e) {}
        }, 10000); // 10s delay

        await interaction.editReply('✅ Atendimento finalizado e logs enviados!').catch(() => {});
    }
};