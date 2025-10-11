// Substitua o conteúdo em: ui/store/cartPanel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateCartPanel(cart, productsInCart, settings, coupon = null) {
    const productMap = new Map();
    productsInCart.forEach(p => {
        if (productMap.has(p.id)) {
            productMap.get(p.id).quantity++;
        } else {
            productMap.set(p.id, { ...p, quantity: 1 });
        }
    });

    let originalPrice = 0;
    const productList = Array.from(productMap.values()).map(p => {
        originalPrice += parseFloat(p.price) * p.quantity;
        return `> 📦 \`${p.quantity}x\` **${p.name}** - \`R$ ${(parseFloat(p.price) * p.quantity).toFixed(2)}\``;
    }).join('\n');

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🛒 Carrinho de Compras')
        .setDescription(productList || 'Seu carrinho está vazio.')
        .setTimestamp()
        .setFooter({ text: `ID do Carrinho: ${cart.channel_id}` });

    // Lógica de cálculo e exibição de preço corrigida
    if (coupon && cart.coupon_id) {
        const discountValue = originalPrice * (coupon.discount_percent / 100);
        const finalPrice = originalPrice - discountValue;
        embed.addFields(
            { name: 'Subtotal', value: `\`R$ ${originalPrice.toFixed(2)}\``, inline: true },
            { name: `🎟️ Desconto (${coupon.code})`, value: `\`- R$ ${discountValue.toFixed(2)}\``, inline: true },
            { name: '💸 Valor Total', value: `**\`R$ ${finalPrice.toFixed(2)}\`**`, inline: false }
        );
        // Garante que o preço no carrinho seja atualizado
        cart.total_price = finalPrice.toFixed(2);
    } else {
        embed.addFields({ name: '💸 Valor Total', value: `**\`R$ ${originalPrice.toFixed(2)}\`**` });
        cart.total_price = originalPrice.toFixed(2);
    }
    
    // Botões reorganizados em fileiras separadas
    const userButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('store_cart_apply_coupon').setLabel('Aplicar Cupom').setStyle(ButtonStyle.Primary).setEmoji('🎟️').setDisabled(!!coupon),
        new ButtonBuilder().setCustomId('store_cart_finalize').setLabel('Finalizar Compra').setStyle(ButtonStyle.Success).setEmoji('💳').setDisabled(productsInCart.length === 0)
    );

    const cancelRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('store_cart_cancel').setLabel('Cancelar e Excluir Carrinho').setStyle(ButtonStyle.Danger).setEmoji('✖️')
    );

    return { embeds: [embed], components: [userButtons, cancelRow] };
};