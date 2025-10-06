// handlers/selects/select_ticket_add_user.js
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_add_user',
    async execute(interaction) {
        await interaction.deferUpdate();
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);

        await interaction.channel.permissionOverwrites.edit(member, { 
            ViewChannel: true, SendMessages: true, ReadMessageHistory: true, AttachFiles: true
        });
        
        const newAction = `> ${member} foi adicionado por ${interaction.user}.\n`;
        await db.query(`UPDATE tickets SET action_log = action_log || $1 WHERE channel_id = $2`, [newAction, interaction.channel.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const openerMember = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);

        // CORREÇÃO: Passa o interaction.member do admin
        const dashboard = generateTicketDashboard(ticketData, openerMember, interaction.member, settings.tickets_cargo_suporte);
        await interaction.editReply({ ...dashboard });

        await interaction.channel.send({ content: `✅ ${member} foi adicionado ao ticket.` });
    }
};