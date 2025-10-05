// handlers/buttons/ticket_claim.js
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_claim',
    async execute(interaction) {
        await interaction.deferUpdate();
        await db.query(`UPDATE tickets SET claimed_by = $1 WHERE channel_id = $2`, [interaction.user.id, interaction.channel.id]);
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const dashboard = generateTicketDashboard(ticketData);
        await interaction.editReply({ ...dashboard });
    }
};