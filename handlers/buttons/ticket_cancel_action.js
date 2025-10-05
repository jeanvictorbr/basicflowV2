// handlers/buttons/ticket_cancel_action.js
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_cancel_action',
    async execute(interaction) {
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const dashboard = generateTicketDashboard(ticketData);
        await interaction.update({ ...dashboard });
    }
};