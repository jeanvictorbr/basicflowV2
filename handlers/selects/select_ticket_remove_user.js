// handlers/selects/select_ticket_remove_user.js
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_remove_user',
    async execute(interaction) {
        await interaction.deferUpdate();
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);

        await interaction.channel.permissionOverwrites.delete(member);
        
        const newAction = `> ${member} foi removido por ${interaction.user}.\n`;
        await db.query(`UPDATE tickets SET action_log = action_log || $1 WHERE channel_id = $2`, [newAction, interaction.channel.id]);

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const openerMember = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);

        const dashboard = generateTicketDashboard(ticketData, openerMember, interaction.user.id, settings.tickets_cargo_suporte);
        await interaction.editReply({ ...dashboard });

        await interaction.channel.send({ content: `❌ ${member} foi removido do ticket.` });
    }
};