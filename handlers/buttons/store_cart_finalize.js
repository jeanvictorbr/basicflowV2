// File: handlers/buttons/store_cart_finalize.js
const db = require('../../database.js');
const generatePaymentMenu = require('../../ui/store/paymentMenu.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'store_cart_finalize',
    async execute(interaction, guildSettings) {
        try {
            // Usa deferReply para criar um novo contexto limpo (evita conflito V1/V2)
            await interaction.deferReply({ ephemeral: true });

            const cartResult = await db.query("SELECT * FROM store_carts WHERE channel_id = $1", [interaction.channel.id]);
            const cart = cartResult.rows[0];

            if (!cart) return interaction.editReply({ content: '❌ Carrinho não encontrado.' });
            
            // Garante que products_json é um array
            const products = cart.products_json || [];

            if (products.length === 0) {
                return interaction.editReply({ content: '⚠️ Seu carrinho está vazio.' });
            }

            // --- CORREÇÃO DO VALOR NULL (CÁLCULO FORÇADO) ---
            let calculatedTotal = 0;
            products.forEach(p => {
                calculatedTotal += parseFloat(p.price) * (p.quantity || 1);
            });

            // Busca e aplica cupom
            let coupon = null;
            if (cart.coupon_id) {
                const couponResult = await db.query("SELECT * FROM store_coupons WHERE id = $1", [cart.coupon_id]);
                coupon = couponResult.rows[0];
                if (coupon) {
                    const discount = calculatedTotal * (coupon.discount_percent / 100);
                    calculatedTotal -= discount;
                }
            }

            // Atualiza o objeto local 'cart' com o valor calculado para o MENU exibir corretamente
            cart.total_price = parseFloat(calculatedTotal.toFixed(2));

            // Opcional: Salvar esse cálculo no banco agora para garantir consistência
            await db.query("UPDATE store_carts SET total_price = $1 WHERE channel_id = $2", [cart.total_price, cart.channel_id]);
            // --------------------------------------------------

            // Gera o Menu V2
            const menuArray = generatePaymentMenu(cart, guildSettings, coupon, interaction.guild);
            const payload = menuArray[0];
            payload.flags = V2_FLAG | EPHEMERAL_FLAG;

            await interaction.editReply(payload);

        } catch (error) {
            console.error('[Store Finalize] Erro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao carregar a tela de pagamento.' });
        }
    }
};