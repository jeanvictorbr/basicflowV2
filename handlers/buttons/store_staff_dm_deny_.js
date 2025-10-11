// handlers/buttons/store_staff_dm_deny_.js
const denyPaymentHandler = require('./store_staff_deny_payment.js');

module.exports = {
    customId: 'store_staff_dm_deny_',
    async execute(interaction) {
        // Esta interação agora vem da THREAD, então o contexto é válido.
        await denyPaymentHandler.execute(interaction);
    }
};