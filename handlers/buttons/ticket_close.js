// handlers/buttons/ticket_close.js
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_close',
    async execute(interaction) {
        await interaction.deferUpdate();

        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const user = await interaction.guild.members.fetch(ticket.user_id).catch(() => null);

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
        const transcriptFile = new AttachmentBuilder(Buffer.from(transcript), { name: `transcript-${interaction.channel.name}.txt` });
        
        if (settings.tickets_canal_logs) {
            const logChannel = await interaction.guild.channels.fetch(settings.tickets_canal_logs);
            const logEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('Ticket Finalizado')
                .addFields(
                    { name: 'Ticket', value: interaction.channel.name },
                    { name: 'Aberto por', value: user ? `${user}` : 'Usuário saiu' },
                    { name: 'Fechado por', value: `${interaction.user}` },
                ).setTimestamp();
            await logChannel.send({ embeds: [logEmbed], files: [transcriptFile] });
        }
        
        await db.query(`UPDATE tickets SET status = 'closed', claimed_by = $1 WHERE channel_id = $2`, [interaction.user.id, interaction.channel.id]);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const dashboard = generateTicketDashboard(ticketData);
        await interaction.editReply({ ...dashboard });
        await interaction.channel.setName(`fechado-${interaction.channel.name.replace('ticket-', '')}`);
    }
};