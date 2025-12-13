// handlers/buttons/ticket_delete.js
const { EmbedBuilder, AttachmentBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database');
const { generateTranscript } = require('../../utils/createTranscript');
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

        // --- NOVA LÓGICA DE PERMISSÃO ---
        let hasPermission = false;
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) hasPermission = true;
        else {
            const channelOverwrites = interaction.channel.permissionOverwrites.cache;
            const isDepartmentStaff = interaction.member.roles.cache.some(r => {
                const overwrite = channelOverwrites.get(r.id);
                return overwrite && overwrite.allow.has(PermissionsBitField.Flags.ManageMessages);
            });
            if (isDepartmentStaff) hasPermission = true;
            if (settings.tickets_cargo_suporte && interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) hasPermission = true;
        }

        if (!hasPermission) {
            return interaction.reply({ content: '⛔ Você não tem permissão para excluir este ticket.', ephemeral: true });
        }
        // --------------------------------

        await interaction.reply({ content: '🧨 O ticket será excluído em 5 segundos...', ephemeral: true });

        // Gera Transcript (HTML)
        let transcriptPath = null;
        try {
            transcriptPath = await generateTranscript(interaction.channel);
        } catch (error) {
            console.error('Falha ao gerar a transcrição do ticket:', error);
        }
        
        // Envia Log
        if (logChannelId) {
            const logChannel = await interaction.guild.channels.fetch(logChannelId).catch(() => null);
            if (logChannel) {
                const user = await interaction.client.users.fetch(ticket.user_id).catch(() => ({ tag: 'Desconhecido', id: '?' }));
                const claimedBy = ticket.claimed_by ? await interaction.client.users.fetch(ticket.claimed_by).catch(() => null) : null;

                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('🗑️ Ticket Excluído')
                    .setDescription(`O ticket \`#${interaction.channel.name}\` foi deletado manualmente.`)
                    .addFields(
                        { name: 'Criador', value: `${user.tag} (${user.id})`, inline: true },
                        { name: 'Deletado por', value: `${interaction.user.tag}`, inline: true },
                        { name: 'Atendido por', value: claimedBy ? `${claimedBy.tag}` : 'Ninguém', inline: true }
                    )
                    .setTimestamp();
                
                const files = [];
                if (transcriptPath) {
                    files.push(new AttachmentBuilder(transcriptPath));
                }

                await logChannel.send({ embeds: [embed], files: files }).catch(() => {});

                if (transcriptPath) fs.unlinkSync(transcriptPath); // Limpa arquivo temp
            }
        }

        setTimeout(async () => {
            await interaction.channel.delete().catch(() => {});
            await db.delete('tickets', 'channel_id', interaction.channel.id);
        }, 5000);
    }
};