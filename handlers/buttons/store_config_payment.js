// Crie em: handlers/buttons/store_config_payment.js
module.exports = {
    customId: 'store_config_payment',
    async execute(interaction) {
        await interaction.reply({ content: '⚙️ A configuração de pagamento automático (Mercado Pago) está em desenvolvimento e será implementada em breve!', ephemeral: true });
    }
};