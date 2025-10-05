// handlers/buttons/ticket_close.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        await interaction.deferUpdate();

        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        if (ticket.status === 'closed') return;

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const opener = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);

        // Gerar Transcrição
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcriptText = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString('pt-BR')}] ${m.author.tag}: ${m.content}`).join('\n');
        const transcriptFile = new AttachmentBuilder(Buffer.from(transcriptText), { name: `transcript-${interaction.channel.name}.txt` });
        
        // Enviar Log Aprimorado
        if (settings.tickets_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.tickets_canal_logs);
            const logEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('📄 Log de Ticket Finalizado')
                .setAuthor({ name: opener?.user.tag || 'Usuário Desconhecido', iconURL: opener?.user.displayAvatarURL() })
                .addFields(
                    { name: 'Ticket ID', value: `\`#${ticket.ticket_number}\``, inline: true },
                    { name: 'Aberto por', value: opener ? `${opener}` : '`Usuário saiu`', inline: true },
                    { name: 'Fechado por', value: `${interaction.user}`, inline: true },
                    { name: 'Assumido por', value: ticket.claimed_by ? `<@${ticket.claimed_by}>` : '`Ninguém`', inline: true }
                )
                .setTimestamp();
            await logChannel.send({ embeds: [logEmbed], files: [transcriptFile] });
        }
        
        await db.query(`UPDATE tickets SET status = 'closed', claimed_by = $1, action_log = action_log || $2 WHERE channel_id = $3`, [interaction.user.id, `> Ticket finalizado por ${interaction.user}.\n`, interaction.channel.id]);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const dashboard = generateTicketDashboard(ticketData, opener);
        await interaction.editReply({ ...dashboard });
        await interaction.channel.setName(`fechado-${ticket.ticket_number}`);
    }
};