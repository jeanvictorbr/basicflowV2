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
            // Usa .catch() para evitar erro se a interação já foi respondida/expirou
            return interaction.reply({ content: '❌ Erro: Não foi possível identificar o canal principal do ticket.', ephemeral: true }).catch(() => {});
        }

        // Tenta deferir, mas protege contra erro de "Unknown Interaction"
        try {
            if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral: true });
        } catch (e) {
            console.error('[Ticket Close] Falha ao deferir:', e.message);
            return; // Se não consegue responder, para aqui.
        }

        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [channelId])).rows[0];
        if (!ticket || ticket.status === 'closed') {
            return interaction.editReply('❌ Ticket não encontrado ou já está fechado.').catch(() => {});
        }

        // Marca o ticket como fechado IMEDIATAMENTE para evitar ações duplicadas.
        await db.query(`UPDATE tickets SET status = 'closed', closed_at = NOW() WHERE channel_id = $1`, [channelId]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        // Define o canal correto para gerar a transcrição
        let transcriptChannel = interaction.channel;
        
        // Se for DM ticket, tenta pegar a thread. Se a thread sumiu, transcriptChannel fica null.
        if (ticket.is_dm_ticket) {
            transcriptChannel = await interaction.guild.channels.fetch(ticket.thread_id).catch(() => null);
        }

        if (!transcriptChannel) {
            return interaction.editReply('⚠️ O canal de origem para a transcrição não foi encontrado (talvez já deletado). O ticket foi fechado no banco.').catch(() => {});
        }

        // --- CORREÇÃO CRÍTICA DO CRASH ---
        let attachment = null;
        let transcriptBuffer = null;

        try {
            // A função createTranscript agora deve estar segura (com o código que te passei antes)
            // Se ela falhar ou retornar null, tratamos aqui.
            transcriptBuffer = await createTranscript(transcriptChannel, interaction.guild);
            
            if (transcriptBuffer) {
                attachment = new AttachmentBuilder(transcriptBuffer, { name: `transcript-${ticket.channel_id}.html` });
            } else {
                console.warn(`[Ticket Close] Transcript gerou buffer vazio para ticket ${ticket.channel_id}`);
            }
        } catch (err) {
            console.error('[Ticket Close] Erro ao gerar transcript:', err);
            // Segue o fluxo sem anexo para não travar o fechamento
        }
        // ----------------------------------

        // LOG EMBED ENRIQUECIDO E UNIFICADO
        if (settings.tickets_log_channel) {
            // Nota: O nome da coluna no banco geralmente é 'tickets_log_channel' e não 'tickets_canal_logs'
            // Verifique seu schema. Se for 'tickets_canal_logs', mantenha. Vou assumir o do seu código.
            const logChannelId = settings.tickets_canal_logs || settings.tickets_log_channel; 

            if (logChannelId) {
                const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
                
                if (logChannel) {
                    const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
                    const claimedBy = ticket.claimed_by ? await interaction.client.users.fetch(ticket.claimed_by).catch(() => null) : null;
                    
                    // Cálculo seguro de timestamp (evita NaN se ID for inválido)
                    let durationMs = 0;
                    try {
                        const creationTimestamp = (BigInt(ticket.channel_id) >> 22n) + 1420070400000n;
                        durationMs = Date.now() - Number(creationTimestamp);
                    } catch (e) {}

                    const logEmbed = new EmbedBuilder()
                        .setColor('Orange')
                        .setTitle(ticket.is_dm_ticket ? '📄 Atendimento via DM Finalizado' : `📄 Ticket #${ticket.ticket_number || 'N/A'} Finalizado`)
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
                    
                    if (!attachment) {
                         logEmbed.setFooter({ text: '⚠️ Transcript não gerado (Erro ou canal vazio)' });
                    }

                    // Envia com ou sem arquivo, sem crashar
                    const payload = { embeds: [logEmbed] };
                    if (attachment) payload.files = [attachment];

                    await logChannel.send(payload).catch(e => console.error('[Log Send Error]', e.message));
                }
            }
        }
        
        // Envio de notificação e transcrição para o usuário
        const user = await interaction.client.users.fetch(ticket.user_id).catch(() => null);
        if (user) {
            await user.send(`Seu atendimento no servidor **${interaction.guild.name}** foi finalizado.`).catch(() => {});
            
            if (settings.tickets_feedback_enabled) {
                // Tenta gerar feedback, se falhar não para o processo
                try {
                    const feedbackMsg = generateFeedbackRequester(ticket);
                    if(feedbackMsg) await user.send(feedbackMsg).catch(() => {});
                } catch(e) { console.error('Erro Feedback:', e); }
            }
        }
        
        // Lógica de exclusão correta com delay para garantir envio de logs
        setTimeout(async () => {
            try {
                // Se é DM ticket (Thread), o 'canal' a deletar é a Thread, não o Parent.
                // Se não é DM, é o próprio canal.
                const channelToDelete = ticket.is_dm_ticket ? transcriptChannel : transcriptChannel; 
                
                // Nota: transcriptChannel.parent deletaria a categoria ou o canal pai da thread.
                // Se transcriptChannel já for a thread, usamos ele mesmo.
                
                if (channelToDelete) {
                    await channelToDelete.delete('Ticket finalizado.').catch(err => {
                        // Ignora erro se já foi deletado (Unknown Channel - 10003)
                        if (err.code !== 10003) console.error(`Falha ao deletar canal/thread ${channelToDelete.id}:`, err.message);
                    });
                }
            } catch (e) {
                console.error('[Ticket Delete Timer] Erro:', e.message);
            }
        }, 10000); // 10 segundos

        await interaction.editReply('✅ Atendimento finalizado com sucesso!').catch(() => {});
    }
};