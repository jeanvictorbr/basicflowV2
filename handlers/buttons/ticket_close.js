// handlers/buttons/ticket_close.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        // VERIFICAÇÃO DE PERMISSÃO
        if (!interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            return interaction.reply({ content: 'Você não tem permissão para usar este botão.', ephemeral: true });
        }

        await interaction.deferUpdate();
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (ticket.status === 'closed') return;

        const opener = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);

        // TRANSCRIÇÃO APRIMORADA
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptText = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString('pt-BR')}] ${m.author.tag} (<@${m.author.id}>): ${m.content}`).join('\n');
        const transcriptFile = new AttachmentBuilder(Buffer.from(transcriptText), { name: `transcript-${interaction.channel.name}.txt` });
        
        // NOVO EMBED DE LOG
        if (settings.tickets_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.tickets_canal_logs);
            const finalActionLog = ticket.action_log + `> Ticket finalizado por <@${interaction.user.id}>.\n`;

            const logEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('📄 Transcrição de Ticket Finalizado')
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
            await logChannel.send({ embeds: [logEmbed], files: [transcriptFile] });
        }
        
        await db.query(`UPDATE tickets SET status = 'closed', claimed_by = $1 WHERE channel_id = $2`, [interaction.user.id, interaction.channel.id]);
        
        // Deleta o canal após 10 segundos
        await interaction.channel.send({ content: 'Este ticket foi finalizado e será deletado em 10 segundos.' });
        setTimeout(async () => {
            await interaction.channel.delete().catch(err => console.error("Não foi possível deletar o canal do ticket:", err));
        }, 10000);
    }
};