// Substitua COMPLETAMENTE o conteúdo do seu arquivo: handlers/buttons/ticket_close.js

const { EmbedBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const { generateTranscript } = require('../../utils/createTranscript'); // IMPORTANDO A FUNÇÃO CORRETA
const fs = require('fs');

// A função de feedback não precisa ser modificada, então a mantive aqui.
async function requestFeedback(interaction, ticket, opener) {
    // ... (seu código de feedback continua aqui, sem alterações)
}

module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        
        const ticketInfo = (await db.query('SELECT user_id FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (!ticketInfo) return;

        const isSupport = interaction.member.roles.cache.has(settings.tickets_cargo_suporte);
        const isOwner = interaction.user.id === ticketInfo.user_id;

        if (!isSupport && !isOwner) {
            return interaction.reply({ content: 'Você não tem permissão para fechar este ticket.', ephemeral: true });
        }

        await interaction.deferUpdate();
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (!ticket || ticket.status === 'closed') return;

        const opener = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);

        // --- INÍCIO DA LÓGICA DE TRANSCRIÇÃO CORRIGIDA ---
        
        let transcriptPath = null;
        try {
            // Gera o arquivo HTML usando a nova função
            transcriptPath = await generateTranscript(interaction.channel);
        } catch (error) {
            console.error('Falha ao gerar a transcrição do ticket ao fechar:', error);
        }

        if (settings.tickets_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.tickets_canal_logs).catch(() => null);
            if (logChannel) {
                const finalActionLog = (ticket.action_log || '') + `> Ticket finalizado por <@${interaction.user.id}>.\n`;

                const logEmbed = new EmbedBuilder()
                    .setColor('Orange')
                    .setTitle('📄 Ticket Finalizado')
                    .setAuthor({ name: opener?.user.tag || `ID: ${ticket.user_id}`, iconURL: opener?.user.displayAvatarURL() })
                    .setThumbnail(opener?.user.displayAvatarURL() || null)
                    .addFields(
                        { name: 'Ticket ID', value: `\`#${String(ticket.ticket_number).padStart(4, '0')}\``, inline: true },
                        { name: 'Aberto por', value: opener ? `${opener}` : '`Usuário saiu`', inline: true },
                        { name: 'Fechado por', value: `${interaction.user}`, inline: true },
                        { name: 'Histórico de Ações', value: finalActionLog.substring(0, 1024) }
                    )
                    .setFooter({ text: `ID do Canal: ${interaction.channel.id}`})
                    .setTimestamp();
                
                const files = [];
                if (transcriptPath) {
                    // Anexa o arquivo HTML gerado
                    files.push(new AttachmentBuilder(transcriptPath));
                }

                await logChannel.send({ embeds: [logEmbed], files: files });
                
                // Apaga o arquivo temporário após o envio
                if (transcriptPath) {
                    fs.unlinkSync(transcriptPath);
                }
            }
        }
        
        // --- FIM DA LÓGICA DE TRANSCRIÇÃO ---

        await db.query(`UPDATE tickets SET status = 'closed', claimed_by = $1, closed_at = NOW() WHERE channel_id = $2`, [interaction.user.id, interaction.channel.id]);
        
        if (settings.tickets_feedback_enabled && opener) {
            // A função de feedback não foi alterada, mas precisa do `opener`.
            await requestFeedback(interaction, ticket, opener);
        }

        await interaction.channel.send({ content: 'Este ticket foi finalizado e será deletado em 10 segundos.' });
        setTimeout(async () => {
            await interaction.channel.delete().catch(err => console.error("Não foi possível deletar o canal do ticket:", err));
        }, 10000);
    }
};