// File: handlers/buttons/store_verify_mp_payment.js
const db = require('../../database.js');
const { getPaymentStatus } = require('../../utils/mercadoPago.js');
const { approvePurchase } = require('../../utils/approvePurchase.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'store_verify_mp_payment',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const cartId = interaction.channel.id;
            const cartResult = await db.query("SELECT * FROM store_carts WHERE channel_id = $1", [cartId]);
            const cart = cartResult.rows[0];

            if (!cart) return interaction.editReply({ content: '❌ Carrinho não encontrado.' });
            if (!cart.payment_id) return interaction.editReply({ content: '⚠️ Nenhum pagamento identificado.' });

            console.log(`[MP Verify] Verificando ID: ${cart.payment_id}`);
            const paymentInfo = await getPaymentStatus(interaction.guild.id, cart.payment_id);

            if (!paymentInfo) {
                return interaction.editReply({ content: '❌ Não foi possível conectar ao Mercado Pago. Tente novamente em instantes.' });
            }

            const status = paymentInfo.status;
            const statusDetail = paymentInfo.status_detail;

            // Botão de emergência para Staff
            const staffRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('store_staff_approve_payment')
                    .setLabel('Staff: Forçar Aprovação')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🛡️')
            );

            if (status === 'approved') {
                await interaction.editReply({ content: '✅ **Pagamento Aprovado!** Processando sua entrega...' });
                try {
                    await approvePurchase(interaction.client, interaction.guild.id, cartId, interaction);
                } catch (deliveryError) {
                    console.error('[MP Verify] Erro na entrega:', deliveryError);
                    await interaction.followUp({ content: '⚠️ Erro na entrega automática. Staff notificada.', flags: EPHEMERAL_FLAG });
                }
            } else if (status === 'pending' || status === 'in_process') {
                return interaction.editReply({ 
                    content: '⏳ **Pagamento Pendente.**\nO banco ainda está processando seu Pix. Aguarde alguns segundos.',
                    components: [staffRow] // Mostra opção para staff
                });
            } else if (status === 'rejected') {
                 return interaction.editReply({ 
                     content: `❌ **Pagamento Rejeitado.** Motivo: ${statusDetail}.`,
                     components: [staffRow]
                });
            } else {
                return interaction.editReply({ 
                    content: `ℹ️ Status atual: **${status}**.`,
                    components: [staffRow]
                });
            }

        } catch (error) {
            console.error('[MP Verify] Erro Crítico:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro interno.' });
        }
    }
};