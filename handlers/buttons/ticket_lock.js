// Crie em: handlers/buttons/ticket_lock.js
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_lock',
    async execute(interaction) {
        await interaction.deferUpdate();
        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const user = await interaction.guild.members.fetch(ticket.user_id);

        const newStatus = ticket.status === 'locked' ? 'open' : 'locked';
        const permissions = newStatus === 'locked' ? [PermissionsBitField.Flags.SendMessages] : [];
        
        await interaction.channel.permissionOverwrites.edit(user, { 'SendMessages': newStatus !== 'locked' });
        await db.query('UPDATE tickets SET status = $1 WHERE channel_id = $2', [newStatus, interaction.channel.id]);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        await interaction.editReply({ components: generateTicketDashboard(ticketData) });
    }
};