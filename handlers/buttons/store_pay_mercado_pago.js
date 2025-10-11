// Substitua o conteúdo em: handlers/buttons/store_pay_mercado_pago.js
const { createPixPayment } = require('../../utils/mercadoPago.js');
const db = require('../../database.js');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { getCartSummary } = require('../../ui/store/dmConversationalFlow.js');
const generatePaymentMenu = require('../../ui/store/paymentMenu.js'); 

module.exports = {
    customId: 'store_pay_mercado_pago',
    async execute(interaction) {
        await interaction.deferUpdate();

        const cartId = interaction.channel.id;
        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        
        const products = cart.products_json || [];
        const coupon = cart.coupon_id ? (await db.query('SELECT * FROM store_coupons WHERE id = $1', [cart.coupon_id])).rows[0] : null;

        try {
            const paymentData = await createPixPayment(interaction.guild.id, cart, products);
            
            const qrCodeBuffer = Buffer.from(paymentData.qrCode, 'base64');
            const attachmentName = `qrcode-pix-${cartId}.png`;

            const { priceString } = getCartSummary(cart, coupon); 
            
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('💳 Pagamento Automático via PIX')
                // INSTRUÇÃO ADICIONADA AQUI
                .setDescription(`Seu pagamento foi gerado. Escaneie o QR Code ou use o código Copia e Cola para pagar o valor de ${priceString}.\n\n**Após o pagamento, clique em "✔️ Verificar Pagamento" para receber seus produtos.**`)
                .addFields(
                    { name: 'Código PIX (Copia e Cola)', value: `\`\`\`${paymentData.qrCodeCopy}\`\`\`` }
                )
                .setImage(`attachment://${attachmentName}`)
                .setFooter({ text: `Aguardando pagamento... | ID: ${paymentData.paymentId}` })
                .setTimestamp();
                
            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`store_verify_mp_payment_${paymentData.paymentId}`)
                    .setLabel('Verificar Pagamento')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✔️'),
                new ButtonBuilder()
                    .setCustomId('store_payment_return_to_cart')
                    .setLabel('Voltar ao Carrinho')
                    .setStyle(ButtonStyle.Secondary)
            );
            
            await interaction.editReply({
                embeds: [embed],
                components: [actionRow],
                files: [{ attachment: qrCodeBuffer, name: attachmentName }],
                content: `Olá, ${interaction.user}! O seu pagamento via Mercado Pago está pronto.`,
            });

        } catch (error) {
            console.error('[Store] Erro ao gerar pagamento com Mercado Pago:', error);
            const paymentMenuPayload = await generatePaymentMenu(cart, settings, coupon, interaction.guild); 
            await interaction.editReply({ 
                content: `❌ **Ocorreu um erro ao gerar o pagamento automático:** ${error.message}. Voltando para o pagamento manual.`,
                embeds: paymentMenuPayload.embeds,
                components: paymentMenuPayload.components,
                files: []
            });
        }
    }
};