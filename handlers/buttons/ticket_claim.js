// handlers/buttons/ticket_claim.js
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_claim',
    async execute(interaction) {
        await interaction.deferUpdate();
        const newAction = `> Ticket assumido por ${interaction.user}.\n`;

        // Adiciona a ação ao log e atualiza quem assumiu
        await db.query(`UPDATE tickets SET claimed_by = $1, action_log = action_log || $2 WHERE channel_id = $3`, [interaction.user.id, newAction, interaction.channel.id]);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const openerMember = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);
        
        const dashboard = generateTicketDashboard(ticketData, openerMember);
        await interaction.editReply({ ...dashboard });
    }
};