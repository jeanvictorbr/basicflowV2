// Crie em: handlers/buttons/ticket_cancel_action.js
// Um handler genérico para os botões "Cancelar" dentro do ticket
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ticket_cancel_action',
    async execute(interaction) {
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        await interaction.update({ components: generateTicketDashboard(ticketData), flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};