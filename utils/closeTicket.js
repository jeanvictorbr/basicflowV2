// File: utils/closeTicket.js
// VERSÃO SEGURA
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database.js');
const createTranscript = require('./createTranscript.js');

async function closeTicket(interaction, guild, channel, userWhoClosed) {
    try {
        // 1. Avisa que começou (Evita clique duplo)
        if (channel) await channel.send('🔒 **Fechando ticket...** Gerando backup, aguarde.');

        // 2. Gera Transcript (Protegido)
        const transcriptBuffer = await createTranscript(channel, guild);
        let attachment = null;
        if (transcriptBuffer) {
            attachment = new AttachmentBuilder(transcriptBuffer, { name: `transcript-${channel.name}.html` });
        }

        // 3. Pega configuração de Logs
        const settings = await db.getGuildSettings(guild.id);
        
        // 4. Envia Log (Se configurado)
        if (settings?.tickets_log_channel) {
            try {
                const logChannel = await guild.channels.fetch(settings.tickets_log_channel).catch(() => null);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Ticket Fechado')
                        .setColor('#ff0000')
                        .addFields(
                            { name: 'Ticket', value: channel.name, inline: true },
                            { name: 'Fechado por', value: userWhoClosed.tag, inline: true }
                        )
                        .setTimestamp();
                    
                    const payload = { embeds: [logEmbed] };
                    if (attachment) payload.files = [attachment];
                    
                    await logChannel.send(payload);
                }
            } catch (err) {
                console.error('[Ticket Log] Falha ao enviar log:', err.message);
            }
        }

        // 5. Tenta enviar DM para o dono do ticket (Opcional, com try/catch forte)
        // ... (Sua lógica de DM aqui, mas envolva em try/catch para não crashar) ...

        // 6. Deleta o canal com delay de segurança
        if (channel) {
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (e) {
                    console.error('[Ticket Close] Falha ao deletar canal (já deletado?):', e.message);
                }
            }, 5000); // 5 segundos de delay para garantir que os logs saíram
        }

    } catch (error) {
        console.error('[Close Ticket Critical] Erro fatal:', error);
        if (channel) channel.send('❌ Erro ao fechar. Contacte o admin.').catch(() => {});
    }
}

module.exports = { closeTicket }; // Exporte assim ou como função única, dependendo do seu require