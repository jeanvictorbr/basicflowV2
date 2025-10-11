// handlers/modals/modal_dm_apply_coupon_.js
const db = require('../../database.js');
const { generateMainCartMessage } = require('../../ui/store/dmConversationalFlow.js');
const { updateCartActivity } = require('../../utils/storeInactivityMonitor.js');
const { ActionRowBuilder, ButtonBuilder } = require('discord.js');

// NOVO: Função auxiliar para desabilitar botões da mensagem que originou o modal
async function disableOriginMessage(interaction) {
    try {
        const messages = await interaction.channel.messages.fetch({ limit: 10 });
        const originMessage = messages.find(m => 
            m.author.id === interaction.client.user.id &&
            m.components[0]?.components.some(c => c.customId === `store_dm_action_apply_coupon_${interaction.customId.split('_')[4]}_${interaction.customId.split('_')[5]}`)
        );

        if (originMessage) {
            const row = ActionRowBuilder.from(originMessage.components[0]);
            const newButtons = row.components.map(button => ButtonBuilder.from(button).setDisabled(true));
            await originMessage.edit({ components: [new ActionRowBuilder().addComponents(newButtons)] });
        }
    } catch (e) {
        // Ignora erros
    }
}

module.exports = {
    customId: 'modal_dm_apply_coupon_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const [, , , , guildId, cartId] = interaction.customId.split('_');
        const code = interaction.fields.getTextInputValue('input_coupon_code').toUpperCase();

        await disableOriginMessage(interaction); // Desabilita a mensagem anterior

        const couponResult = await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 AND code = $2 AND is_active = true AND uses_left > 0', [guildId, code]);
        const coupon = couponResult.rows[0];

        const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];

        if (!coupon) {
            const reply = generateMainCartMessage(cart, `❌ O cupom \`${code}\` é inválido ou já foi utilizado.`);
            await interaction.channel.send(reply);
            return interaction.editReply({ content: 'Cupom inválido. Verifique a mensagem acima.' });
        }
        
        await db.query('UPDATE store_carts SET coupon_id = $1 WHERE channel_id = $2', [coupon.id, cartId]);
        await db.query('UPDATE store_coupons SET uses_left = uses_left - 1 WHERE id = $1', [coupon.id]);
        await updateCartActivity(cartId);
        
        const updatedCart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];

        const conversationalMessage = generateMainCartMessage(updatedCart, `✅ Cupom \`${code}\` aplicado com sucesso!`, coupon);
        await interaction.channel.send(conversationalMessage);
        return interaction.editReply({ content: 'Cupom aplicado! Verifique a nova mensagem na nossa conversa.' });
    }
};