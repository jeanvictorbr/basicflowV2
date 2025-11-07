// ui/store/staffCartPanel.js
// VERIFIQUE QUE SEU ARQUIVO ESTÁ ASSIM (Baseado no seu 'a8504d6')

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateStaffCartPanel(cart, productsInCart, customer) {

    const productList = productsInCart.map(p => `> • ${p.name} - R$ ${parseFloat(p.price).toFixed(2)}`).join('\n');
    const totalPrice = (cart.total_price ? parseFloat(cart.total_price) : productsInCart.reduce((sum, p) => sum + parseFloat(p.price), 0)).toFixed(2);

    const embed = new EmbedBuilder()
        .setColor('#E67E22')
        .setTitle(`🤝 Atendimento - Carrinho #${cart.channel_id}`) // Pega o ID do canal
        .setAuthor({ name: `Cliente: ${customer.tag}`, iconURL: customer.displayAvatarURL() })
        .setDescription('Responda nesta thread para falar com o cliente. Use os botões para gerenciar a compra.')
        .addFields(
            { name: 'Itens no Carrinho', value: productList || 'Nenhum' },
            { name: 'Valor Total', value: `**R$ ${totalPrice}**` }
        )
        .setFooter({ text: `ID do Cliente: ${cart.user_id}` });

    // Desabilitar botões se já processado
    const buttonsDisabled = cart.status === 'approved' || cart.status === 'denied';
    if (buttonsDisabled) {
        let statusText = cart.status === 'approved' ? 'Aprovado' : 'Recusado';
        embed.setDescription(`Status: **${statusText}** por <@${cart.staff_id}>`);
        embed.setColor(cart.status === 'approved' ? '#2ECC71' : '#E74C3C');
    }

    // IDs ESTÁTICOS (Correto para os handlers que forneci acima)
    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('store_staff_approve_payment')
            .setLabel('Marcar como Pago')
            .setStyle(ButtonStyle.Success)
            .setEmoji('✅')
            .setDisabled(buttonsDisabled),
        new ButtonBuilder()
            .setCustomId('store_staff_deny_payment')
            .setLabel('Cancelar Compra')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('❌')
            .setDisabled(buttonsDisabled)
    );

    return { embeds: [embed], components: [actionRow] };
};