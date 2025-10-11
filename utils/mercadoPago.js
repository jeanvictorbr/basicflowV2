// utils/mercadoPago.js
const { MercadoPagoConfig, Payment } = require('mercadopago');
const db = require('../database.js');

async function getPaymentStatus(guildId, paymentId) {
    const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    if (!settings || !settings.store_mp_token) {
        throw new Error('O token de acesso do Mercado Pago não está configurado.');
    }
    const client = new MercadoPagoConfig({ accessToken: settings.store_mp_token });
    const payment = new Payment(client);
    try {
        const paymentInfo = await payment.get({ id: paymentId });
        return paymentInfo;
    } catch (error) {
        console.error(`[Mercado Pago] Erro ao buscar status do pagamento ${paymentId}:`, error.cause || error);
        throw new Error('Falha ao buscar informações do pagamento no Mercado Pago.');
    }
}

async function createPixPayment(guildId, cart, products) {
    const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    if (!settings || !settings.store_mp_token) {
        throw new Error('O token de acesso do Mercado Pago não está configurado para esta guilda.');
    }

    const client = new MercadoPagoConfig({ accessToken: settings.store_mp_token });
    const payment = new Payment(client);

    const totalPrice = parseFloat(cart.total_price);

    if (isNaN(totalPrice) || totalPrice <= 0) {
        throw new Error('O valor total da compra deve ser positivo. Não é possível gerar um pagamento de R$0,00.');
    }

    const description = `Compra de ${products.map(p => p.name).join(', ')}`;
    const notificationUrl = process.env.MP_WEBHOOK_URL || 'https://seu-dominio.com/mp-webhook';

    const paymentData = {
        transaction_amount: totalPrice,
        description: description,
        payment_method_id: 'pix',
        payer: {
            email: `user_${cart.user_id}@discord-bot.com`,
        },
        notification_url: notificationUrl,
        external_reference: cart.channel_id,
    };

    try {
        const result = await payment.create({ body: paymentData });
        const paymentId = result.id;
        
        await db.query('UPDATE store_carts SET payment_id = $1 WHERE channel_id = $2', [paymentId, cart.channel_id]);

        return {
            qrCode: result.point_of_interaction.transaction_data.qr_code_base64,
            qrCodeCopy: result.point_of_interaction.transaction_data.qr_code,
            paymentId: paymentId
        };
    } catch (error) {
        console.error('[Mercado Pago] Erro ao criar pagamento:', error.cause || error);
        throw new Error('Falha ao gerar o pagamento PIX no Mercado Pago.');
    }
}

module.exports = { createPixPayment, getPaymentStatus };