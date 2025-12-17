// Substitua o conteúdo em: ui/store/dmConversationalFlow.js
// jeanvictorbr/basicflowv2-beta/basicflowV2-BETA-37a76a5f8c6981d2e0e8259174db35646d1de700/ui/store/dmConversationalFlow.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getCartSummary(cart, coupon = null) {
    const productsInCart = cart.products_json || [];
    const productMap = new Map();
    productsInCart.forEach(p => {
        if (productMap.has(p.id)) {
            productMap.get(p.id).quantity++;
        } else {
            productMap.set(p.id, { ...p, quantity: 1 });
        }
    });

    let originalPrice = 0;
    Array.from(productMap.values()).forEach(p => {
        originalPrice += parseFloat(p.price) * p.quantity;
    });
    
    let totalPrice = originalPrice;
    let priceString = `**R$ ${totalPrice.toFixed(2)}**`;

    if (coupon) {
        const discountValue = originalPrice * (coupon.discount_percent / 100);
        totalPrice -= discountValue;
        priceString = `de \`R$ ${originalPrice.toFixed(2)}\` por **R$ ${totalPrice.toFixed(2)}** (\`${coupon.discount_percent}%\` OFF)`;
    }

    return { priceString, totalPrice: totalPrice.toFixed(2) };
}


// ... (funções generatePaymentMessage e generateAutomaticPaymentDM - Mantidas inalteradas)
function generatePaymentMessage(cart, settings, coupon = null) {
    const { priceString } = getCartSummary(cart, coupon);
    const pixKey = settings?.store_pix_key || "CHAVE PIX NÃO CONFIGURADA";

     const embed = new EmbedBuilder()
        .setColor('#F1C40F')
        .setTitle('💳 Pagamento via PIX (Manual)')
        .setDescription('Siga os passos para concluir sua compra:')
        .addFields(
            { name: '1. Realize o Pagamento', value: `Use a chave PIX abaixo para pagar o valor total de ${priceString}.` },
            { name: 'Chave PIX', value: `\`${pixKey}\`` },
            { name: '2. Envie o Comprovante', value: `Após pagar, **vá para a thread de atendimento criada para você no servidor e anexe a imagem do comprovante**.` }
        )
        .setFooter({ text: 'Se precisar de ajuda, clique em "Notificar Staff".'})
        .setTimestamp();
    
    const guildId = cart.guild_id;
    const cartId = cart.channel_id;

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`store_dm_alert_staff_${guildId}_${cartId}`)
            .setLabel('Notificar Staff')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔔'),
        new ButtonBuilder()
            .setCustomId(`store_dm_cancel_confirm_${guildId}_${cartId}`)
            .setLabel('Cancelar Compra')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('✖️')
    );
    
    return { embeds: [embed], components: [buttons] };
}

function generateAutomaticPaymentDM(cart, paymentData) {
    const cartId = cart.channel_id;
    const qrCodeBuffer = Buffer.from(paymentData.qrCode, 'base64');
    const attachmentName = `qrcode-pix-${cartId}.png`;

    const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Pagamento Automático via PIX')
        .setDescription('Escaneie o QR Code com o app do seu banco ou use o código "Copia e Cola".\n\n**Após pagar, clique em "Verificar Pagamento" para receber seus produtos instantaneamente.**\n\n*Se precisar de ajuda, basta enviar uma mensagem aqui e um atendente será notificado para lhe responder.*')
        .addFields(
            { name: 'Código PIX (Copia e Cola)', value: `\`\`\`${paymentData.qrCodeCopy}\`\`\`` }
        )
        .setImage(`attachment://${attachmentName}`)
        .setFooter({ text: `Aguardando pagamento... | ID: ${paymentData.paymentId}` });

    const customIdString = `store_verify_mp_payment_${cart.guild_id || 'FAIL-G'}_${paymentData.paymentId || 'FAIL-P'}`;

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(customIdString) 
            .setLabel('Verificar Pagamento')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✔️'),
        new ButtonBuilder()
            .setCustomId(`store_dm_cancel_confirm_${cart.guild_id}_${cart.channel_id}`)
            .setLabel('Cancelar Compra')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('✖️')
    );

    return {
        embeds: [embed],
        files: [{ attachment: qrCodeBuffer, name: attachmentName }],
        components: [actionRow],
    };
}

module.exports = {
    generatePaymentMessage,
    generateAutomaticPaymentDM,
    getCartSummary // << EXPORT CRÍTICO ADICIONADO
};