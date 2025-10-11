// Substitua o conteúdo em: handlers/modals/modal_vitrine_apply_coupon.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'modal_vitrine_apply_coupon_',
    async execute(interaction) {
        await interaction.deferUpdate();

        // CORREÇÃO: Lógica de parsing de IDs robusta.
        const productIds = interaction.customId.replace('modal_vitrine_apply_coupon_', '').split('-');
        const code = interaction.fields.getTextInputValue('input_coupon_code').toUpperCase();

        const coupon = (await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 AND code = $2 AND is_active = true AND uses_left > 0', [interaction.guild.id, code])).rows[0];
        
        if (!coupon) {
            return interaction.followUp({ content: '❌ Cupom inválido, expirado ou já utilizado.', ephemeral: true });
        }

        const products = (await db.query(`SELECT id, name, price FROM store_products WHERE id = ANY($1::int[])`, [productIds])).rows;
        
        const originalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        const discountAmount = originalPrice * (coupon.discount_percent / 100);
        const finalPrice = originalPrice - discountAmount;

        const productList = products.map(p => `> • **${p.name}** - \`R$ ${parseFloat(p.price).toFixed(2)}\``).join('\n');
        const idsString = productIds.join('-');

        const updatedMessage = `### Confirme sua seleção\nVocê deseja comprar os seguintes itens?\n\n${productList}\n\n` +
                               `**Subtotal:** \`R$ ${originalPrice.toFixed(2)}\`\n` +
                               `**Desconto (${coupon.code}):** \` - R$ ${discountAmount.toFixed(2)}\`\n` +
                               `**Total:** \`R$ ${finalPrice.toFixed(2)}\`\n\n*Para cancelar, apenas ignore esta mensagem.*`;
        
        const updatedButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`store_confirm_purchase_products_${idsString}_coupon_${coupon.id}`)
                .setLabel('Confirmar Compra')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🛒'),
            new ButtonBuilder()
                .setCustomId(`store_vitrine_coupon_${idsString}`)
                .setLabel('Cupom Aplicado')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎟️')
                .setDisabled(true)
        );

        await interaction.editReply({
            content: updatedMessage,
            components: [updatedButtons]
        });
    }
};