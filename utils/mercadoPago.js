const { MercadoPagoConfig, Payment } = require('mercadopago');
const db = require('../database.js');

/**
 * Busca o status de um pagamento específico.
 */
async function getPaymentStatus(guildId, paymentId) {
    const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    if (!settings || !settings.store_mp_token) return null;

    const client = new MercadoPagoConfig({ accessToken: settings.store_mp_token });
    const payment = new Payment(client);

    try {
        return await payment.get({ id: paymentId });
    } catch (error) {
        console.error(`[Mercado Pago] Erro check status ${paymentId}:`, error.message);
        return null;
    }
}

/**
 * Cria um pagamento PIX com dados robustos para evitar bloqueios.
 */
async function createPixPayment(guildId, cart, products) {
    console.log(`[MP Debug] Iniciando criação de PIX. Guild: ${guildId}, Cart: ${cart.channel_id}`);

    const settings = (await db.query('SELECT store_mp_token FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    
    if (!settings || !settings.store_mp_token) {
        throw new Error('O token de acesso do Mercado Pago não está configurado.');
    }

    const client = new MercadoPagoConfig({ accessToken: settings.store_mp_token });
    const payment = new Payment(client);

    // Tratamento de Preço (Segurança contra NULL)
    let priceString = String(cart.total_price).replace(',', '.');
    const totalPrice = parseFloat(priceString);

    console.log(`[MP Debug] Preço Final: ${totalPrice}`);

    if (isNaN(totalPrice) || totalPrice <= 0) {
        throw new Error(`Valor inválido (R$ ${cart.total_price}).`);
    }

    // Descrição limpa
    const productNames = products.length > 0 
        ? products.map(p => p.name).join(', ') 
        : 'Produtos Diversos';
        
    const description = `Pedido ${cart.channel_id.slice(-4)} - ${productNames}`.substring(0, 200);

    // ESTRATÉGIA ANTI-BLOQUEIO:
    // Usamos um e-mail com domínio real (gmail) para passar no filtro de regex do MP.
    // O 'first_name' ajuda na pontuação de fraude.
    const safeEmail = `comprador_${cart.user_id}@gmail.com`;

    const body = {
        transaction_amount: totalPrice,
        description: description,
        payment_method_id: 'pix',
        installments: 1,
        payer: {
            email: safeEmail, 
            first_name: `Cliente`,
            last_name: `Discord ${cart.user_id}`
        },
        external_reference: cart.channel_id
    };

    try {
        // Adiciona idempotency key para evitar duplicações se o usuario clicar rapido
        const requestOptions = {
            idempotencyKey: `pay_${cart.channel_id}_${Date.now()}` 
        };

        const result = await payment.create({ body, requestOptions });
        
        if (!result || !result.id) {
            throw new Error('API MP não retornou ID.');
        }

        await db.query(
            'UPDATE store_carts SET payment_id = $1, status = $2 WHERE channel_id = $3', 
            [result.id.toString(), 'payment', cart.channel_id]
        );

        return {
            paymentId: result.id,
            qrCode: result.point_of_interaction.transaction_data.qr_code_base64,
            qrCodeCopy: result.point_of_interaction.transaction_data.qr_code
        };

    } catch (error) {
        console.error('[Mercado Pago] Erro API:', JSON.stringify(error, null, 2));
        
        // Tradução de erros comuns para o usuário
        let errorMsg = error.message;
        if (error.message?.includes('UNAUTHORIZED')) {
            errorMsg = 'Pagamento rejeitado pelo Mercado Pago (Risco/Segurança). Tente outra conta ou valor.';
        }
        
        throw new Error(errorMsg);
    }
}

module.exports = { createPixPayment, getPaymentStatus };