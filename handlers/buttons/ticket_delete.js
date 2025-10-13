// Substitua COMPLETAMENTE o conteúdo do seu arquivo: handlers/buttons/ticket_delete.js

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database');
const { generateTranscript } = require('../../utils/createTranscript'); // Importa a função de gerar HTML
const fs = require('fs');

module.exports = {
    customId: 'ticket_delete',
    async execute(interaction) {
        const ticket = await db.get('tickets', 'channel_id', interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: 'Este não é um canal de ticket válido.', ephemeral: true });
        }

        const settings = await db.get('guild_settings', 'guild_id', interaction.guild.id);
        const logChannelId = settings?.tickets_canal_logs;
        const supportRoleId = settings?.tickets_cargo_suporte;

        const member = await interaction.guild.members.fetch(interaction.user.id);
        if (!member.permissions.has(PermissionsBitField.Flags.Administrator) && (!supportRoleId || !member.roles.cache.has(supportRoleId))) {
            return interaction.reply({ content: '❌ Você não tem permissão para excluir este ticket.', ephemeral: true });
        }

        await interaction.reply({ content: '✅ O ticket será excluído em 5 segundos...', ephemeral: true });

        // --- INÍCIO DA GERAÇÃO DA TRANSCRIÇÃO ---
        // A lógica antiga de criar um .txt foi REMOVIDA daqui.
        // Agora, apenas a função para gerar HTML é chamada.

        let transcriptPath = null;
        try {
            transcriptPath = await generateTranscript(interaction.channel);
        } catch (error) {
            console.error('Falha ao gerar a transcrição do ticket:', error);
            if (logChannelId) {
                const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    logChannel.send({ content: `⚠️ Falha ao gerar a transcrição para o ticket #${interaction.channel.name}.` });
                }
            }
        }
        
        // --- ENVIO DO LOG ---
        if (logChannelId) {
            const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
            if (logChannel) {
                const user = await interaction.client.users.fetch(ticket.user_id);
                const claimedBy = ticket.claimed_by ? await interaction.client.users.fetch(ticket.claimed_by) : null;

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('Ticket Excluído')
                    .setDescription(`O ticket \`#${interaction.channel.name}\` foi excluído.`)
                    .addFields(
                        { name: 'Aberto por', value: `${user.tag} (${user.id})`, inline: true },
                        { name: 'Fechado por', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
                        { name: 'Atendido por', value: claimedBy ? `${claimedBy.tag}` : 'Ninguém', inline: true },
                        { name: 'Data', value: `<t:${Math.floor(Date.now() / 1000)}:f>`, inline: false }
                    )
                    .setTimestamp();
                
                // Array de arquivos para anexo. Ele começará vazio.
                const files = [];
                if (transcriptPath) {
                    // Adiciona APENAS o anexo HTML se ele foi criado com sucesso.
                    const attachment = new AttachmentBuilder(transcriptPath);
                    files.push(attachment);
                }

                await logChannel.send({ embeds: [embed], files: files });

                // Apaga o arquivo temporário da transcrição
                if (transcriptPath) {
                    fs.unlinkSync(transcriptPath);
                }
            }
        }

        setTimeout(async () => {
            await interaction.channel.delete();
            await db.delete('tickets', 'channel_id', interaction.channel.id);
        }, 5000);
    }
};