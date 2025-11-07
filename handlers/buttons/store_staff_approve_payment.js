// handlers/buttons/store_staff_approve_payment.js
const db = require('../../database.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants.js');
const { approvePurchase } = require('../../utils/approvePurchase.js'); // Importa o novo util
const generateStaffCartPanel = require('../../ui/store/staffCartPanel.js');

module.exports = {
    customId: 'store_staff_approve_payment',
    async execute(interaction) {
        const cartChannelId = interaction.channel.isThread() ? interaction.channel.parentId : interaction.channel.id;
        
        if (!cartChannelId) { 
            return interaction.reply({ content: '❌ Erro: Não foi possível identificar o carrinho.', flags: EPHEMERAL_FLAG }); 
        }

        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        try {
            // 1. Buscar o carrinho pelo channel_id
            const cartRes = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartChannelId]);
            if (cartRes.rows.length === 0) {
                return await interaction.editReply({ content: 'Este carrinho não foi encontrado.' });
            }
            const cart = cartRes.rows[0];

            if (cart.status === 'delivered') {
                return await interaction.editReply({ content: 'Este pagamento já foi processado e entregue.' });
            }
            
            // 2. Verificar permissão do Staff
            const settingsRes = await db.query('SELECT store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
            const settings = settingsRes.rows[0];
            if (!settings || !settings.store_staff_role_id || !interaction.member.roles.cache.has(settings.store_staff_role_id)) {
                return interaction.editReply({ content: '❌ Você não tem permissão para aprovar pagamentos.' });
            }
            
            // 3. Chamar a lógica de aprovação centralizada
            const approvalResult = await approvePurchase(
                interaction.client,
                interaction.guild.id,
                cartChannelId,
                interaction.member // Passa o staff que aprovou
            );

            if (!approvalResult.success) {
                return await interaction.editReply({
                    content: `❌ Falha ao aprovar a compra: ${approvalResult.error}`
                });
            }

            // 4. Atualizar o painel do staff (se a interação for de um botão no painel)
            if (interaction.message) {
                const customer = await interaction.client.users.fetch(cart.user_id).catch(() => ({ tag: 'Desconhecido', displayAvatarURL: () => null }));
                // Re-busca o carrinho para obter o status 'delivered'
                const updatedCart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartChannelId])).rows[0];
                const updatedPanel = generateStaffCartPanel(updatedCart, cart.products_json || [], customer);
                
                await interaction.message.edit(updatedPanel).catch(() => {});
            }

            // 5. Notificar o staff e agendar fechamento
            await interaction.editReply({
                content: `✅ Pagamento de <@${cart.user_id}> aprovado com sucesso! Os produtos foram entregues. Este canal será fechado em 10 segundos.`
            });
            
            setTimeout(async () => {
                try {
                    // Garante que vai deletar o canal pai se for uma thread
                    const channelToClose = interaction.channel.isThread() ? interaction.channel.parent : interaction.channel;
                    if (channelToClose) {
                        await channelToClose.delete('Compra aprovada pelo staff.');
                    }
                } catch (e) {
                    console.error(`[Store Approve] Falha ao deletar canal ${cartChannelId}:`, e);
                }
            }, 10000); // 10 segundos

        } catch (error) {
            console.error('[store_staff_approve_payment] Erro ao aprovar pagamento:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro interno ao tentar aprovar este pagamento. Verifique os logs.'
            }).catch(() => {});
        }
    }
};