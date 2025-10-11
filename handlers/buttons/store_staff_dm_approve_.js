// handlers/buttons/store_staff_dm_approve_.js
const approvePaymentHandler = require('./store_staff_approve_payment.js');

module.exports = {
    customId: 'store_staff_dm_approve_',
    async execute(interaction) {
        // Esta interação agora vem da THREAD, então o contexto é válido.
        // Apenas chamamos o handler principal.
        await approvePaymentHandler.execute(interaction);
    }
};