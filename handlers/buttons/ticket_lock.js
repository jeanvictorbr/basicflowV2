// Substitua em: handlers/buttons/ticket_lock.js
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_lock',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            return interaction.reply({ content: 'Você não tem permissão para trancar ou destrancar um ticket.', ephemeral: true });
        }

        const newStatus = ticket.status === 'locked' ? 'open' : 'locked';
        const newAction = newStatus === 'locked' ? `> Ticket trancado por ${interaction.user}.\n` : `> Ticket destrancado por ${interaction.user}.\n`;
        
        // Edita a permissão do usuário de enviar mensagens
        await interaction.channel.permissionOverwrites.edit(user, { 'SendMessages': newStatus !== 'locked' });
        await db.query('UPDATE tickets SET status = $1, action_log = action_log || $2 WHERE channel_id = $3', [newStatus, newAction, interaction.channel.id]);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const dashboard = generateTicketDashboard(ticketData, user);
        await interaction.editReply({ ...dashboard });
    }
};