// Crie em: handlers/buttons/ticket_close_by_user.js
const ticketCloseHandler = require('./ticket_close.js');

module.exports = {
    customId: 'ticket_close_by_user',
    async execute(interaction) {
        // Reutiliza a mesma lógica de fechamento do admin
        await ticketCloseHandler.execute(interaction);
    }
};