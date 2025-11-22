// File: ui/store/paymentMenu.js
module.exports = function generatePaymentMenu(cart, settings, coupon, guild) {
    
    const hasMpToken = !!settings.store_mp_token;
    const hasPixKey = !!settings.store_pix_key;
    const totalPrice = cart.total_price;

    const paymentButtons = [];

    if (hasMpToken) {
        paymentButtons.push({
            type: 2, style: 3, label: "Pagar com Pix Automático",
            emoji: { name: "💠" }, custom_id: "store_pay_mercado_pago"
        });
    }

    if (hasPixKey) {
        paymentButtons.push({
            type: 2, style: 1, label: "Pix Manual (Comprovante)",
            emoji: { name: "📄" }, custom_id: "store_pay_manual"
        });
    }

    paymentButtons.push({
        type: 2, style: 4, label: "Cancelar Compra", custom_id: "store_cart_cancel"
    });

    return [
        {
            type: 17,
            components: [
                {
                    type: 10,
                    content: `## 🛒 Finalizar Compra\nConfira os valores e escolha como pagar.\n\n> 🏷️ **Cupom:** ${coupon ? coupon.code : 'Nenhum'}\n> 💰 **TOTAL A PAGAR:** **R$ ${totalPrice}**`
                },
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1,
                    components: paymentButtons.length > 0 ? paymentButtons : [{ type: 2, style: 2, label: "Sem métodos de pagamento", disabled: true, custom_id: "no_method" }]
                },
                { type: 14, divider: true, spacing: 1 },
                {
                    type: 1,
                    components: [{ type: 2, style: 2, label: "Voltar ao Carrinho", emoji: { name: "↩️" }, custom_id: "store_payment_return_to_cart" }]
                }
            ]
        }
    ];
};