// Crie em: handlers/buttons/ticket_user_close.js
const ticketCloseHandler = require('./ticket_close.js');

module.exports = {
    customId: 'ticket_user_close',
    async execute(interaction) {
        // Reutiliza a lógica de fechamento, mas sem verificação de permissão, pois qualquer um pode desistir do seu próprio ticket.
        await ticketCloseHandler.execute(interaction);
    }
};