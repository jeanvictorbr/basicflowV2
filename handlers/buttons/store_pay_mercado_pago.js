// File: handlers/buttons/store_pay_mercado_pago.js
const { createPixPayment } = require('../../utils/mercadoPago.js');
const db = require('../../database.js');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'store_pay_mercado_pago',
    async execute(interaction) {
        // Usa deferReply EPHEMERAL para não expor dados
        await interaction.deferReply({ ephemeral: true });

        try {
            const cartId = interaction.channel.id;
            
            // 1. Busca dados vitais
            const cartQuery = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId]);
            const cart = cartQuery.rows[0];
            
            if (!cart) return interaction.editReply("❌ Carrinho não encontrado.");

            // 2. RECÁLCULO DE SEGURANÇA
            const products = cart.products_json || [];
            let calculatedTotal = 0;
            
            products.forEach(p => {
                calculatedTotal += parseFloat(p.price) * (p.quantity || 1);
            });

            // Aplica cupom se existir
            let couponCode = "Nenhum";
            if (cart.coupon_id) {
                const couponRes = await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id]);
                const coupon = couponRes.rows[0];
                if (coupon) {
                    const discount = calculatedTotal * (coupon.discount_percent / 100);
                    calculatedTotal -= discount;
                    couponCode = coupon.code;
                }
            }

            calculatedTotal = parseFloat(calculatedTotal.toFixed(2));

            // 3. SALVA O PREÇO NO BANCO
            await db.query('UPDATE store_carts SET total_price = $1 WHERE channel_id = $2', [calculatedTotal, cartId]);
            cart.total_price = calculatedTotal;

            console.log(`[Debug Pagamento] Total Calculado: ${calculatedTotal} | Produtos: ${products.length}`);

            if (calculatedTotal <= 0) {
                return interaction.editReply("⚠️ O valor total do carrinho é R$ 0,00 ou inválido. Adicione produtos antes de pagar.");
            }

            // 4. Gera o Pagamento
            const paymentData = await createPixPayment(interaction.guild.id, cart, products);
            
            const qrCodeBuffer = Buffer.from(paymentData.qrCode, 'base64');
            const attachmentName = `qrcode-pix.png`;

            const embed = new EmbedBuilder()
                .setColor('#2ECC71') 
                .setTitle('💠 Pagamento Pix Gerado!')
                .setDescription(`**Valor Final:** R$ ${calculatedTotal.toFixed(2).replace('.', ',')}\n**Cupom:** ${couponCode}\n\n1️⃣ Abra o app do seu banco.\n2️⃣ Escolha **Pix** > **Ler QR Code**.\n3️⃣ Aponte a câmera ou use o código abaixo.`)
                .addFields(
                    { name: '👇 Pix Copia e Cola', value: `\`\`\`${paymentData.qrCodeCopy}\`\`\`` }
                )
                .setImage(`attachment://${attachmentName}`)
                .setFooter({ text: `ID do Pagamento: ${paymentData.paymentId}` })
                .setTimestamp();
                
            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`store_verify_mp_payment`)
                    .setLabel('Já paguei! Verificar')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✔️'),
                // --- BOTAO DE STAFF ADICIONADO AQUI ---
                new ButtonBuilder()
                    .setCustomId('store_staff_approve_payment')
                    .setLabel('Staff: Aprovar Manualmente')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛡️')
            );
            
            await interaction.editReply({
                embeds: [embed],
                components: [actionRow],
                files: [{ attachment: qrCodeBuffer, name: attachmentName }]
            });

        } catch (error) {
            console.error('[Store] Erro MP:', error);
            await interaction.editReply({ 
                content: `❌ **Erro ao gerar Pix:** ${error.message}`
            });
        }
    }
};