// ui/store/staffCartPanel.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateStaffCartPanel(cart, productsInCart, customer) {

    const productList = productsInCart.map(p => `> • ${p.name} - R$ ${parseFloat(p.price).toFixed(2)}`).join('\n');
    const totalPrice = (cart.total_price ? parseFloat(cart.total_price) : productsInCart.reduce((sum, p) => sum + parseFloat(p.price), 0)).toFixed(2);

    const embed = new EmbedBuilder()
        .setColor('#E67E22')
        .setTitle(`🤝 Atendimento - Carrinho #${cart.channel_id}`)
        .setAuthor({ name: `Cliente: ${customer.tag}`, iconURL: customer.displayAvatarURL() })
        .setDescription('Responda nesta thread para falar com o cliente. Use os botões para gerenciar a compra.')
        .addFields(
            { name: 'Itens no Carrinho', value: productList || 'Nenhum' },
            { name: 'Valor Total', value: `**R$ ${totalPrice}**` }
        )
        .setFooter({ text: `ID do Cliente: ${cart.user_id}` });

    // CORREÇÃO: Os customIds agora são os handlers de DENTRO do servidor, pois os botões estão na thread.
    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('store_staff_approve_payment').setLabel('Marcar como Pago').setStyle(ButtonStyle.Success).setEmoji('✅'),
        new ButtonBuilder().setCustomId('store_staff_deny_payment').setLabel('Cancelar Compra').setStyle(ButtonStyle.Danger).setEmoji('❌')
    );

    return { embeds: [embed], components: [actionRow] };
};