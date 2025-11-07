// handlers/buttons/store_staff_deny_payment.js
const db = require('../../database.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants.js');
const generateStaffCartPanel = require('../../ui/store/staffCartPanel.js');
const { EmbedBuilder } = require('discord.js'); // Adicionado

module.exports = {
    customId: 'store_staff_deny_payment',
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
                return await interaction.editReply({
                    content: 'Este carrinho não foi encontrado ou já foi processado.'
                });
            }
            const cart = cartRes.rows[0];

            if (cart.status === 'denied' || cart.status === 'delivered') {
                return await interaction.editReply({
                    content: 'Este carrinho já foi finalizado (aprovado ou recusado).'
                });
            }
            
            // 2. CORREÇÃO: Usar products_json
            const cartItems = cart.products_json; 
             if (!cartItems) {
                 // CORREÇÃO: Usar channel_id
                 console.warn(`[store_staff_deny_payment] Carrinho ${cart.channel_id} sendo recusado sem itens no JSONB.`);
             }

            // 3. CORREÇÃO: Usar guild_settings
            const settingsRes = await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id]);
            const settings = settingsRes.rows[0];

            if (!settings || !settings.store_staff_role_id || !interaction.member.roles.cache.has(settings.store_staff_role_id)) {
                return interaction.editReply({ content: '❌ Você não tem permissão para recusar pagamentos.' });
            }

            // 4. CORREÇÃO: Usar channel_id como PK e claimed_by_staff_id
            await db.query(
                'UPDATE store_carts SET status = $1, claimed_by_staff_id = $2 WHERE channel_id = $3',
                ['denied', interaction.user.id, cart.channel_id] 
            );

            // 5. Logar a recusa (simplificado)
            if (settings.store_log_channel_id) {
                const logChannel = await interaction.client.channels.fetch(settings.store_log_channel_id).catch(() => null);
                if (logChannel) {
                    const buyer = await interaction.client.users.fetch(cart.user_id).catch(() => ({ tag: 'Usuário Desconhecido', id: cart.user_id }));
                    const logEmbed = new EmbedBuilder()
                        .setTitle('❌ Venda Recusada')
                        .setColor('Red')
                        .setDescription(`**Cliente:** ${buyer.tag} (\`${buyer.id}\`)\n**Atendente:** ${interaction.user.tag}\n**Carrinho:** \`#${(interaction.channel.parent || interaction.channel).name}\``)
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            // 6. Tentar notificar o usuário via DM
            const buyer = await interaction.client.users.fetch(cart.user_id).catch(() => null);
            if (buyer) {
                await buyer.send(`Olá! Infelizmente, sua compra (Carrinho \`#${(interaction.channel.parent || interaction.channel).name}\`) no servidor **${interaction.guild.name}** foi cancelada pela nossa equipe.`).catch(() => {});
            }
            
            // 7. Atualizar o painel do staff
            cart.status = 'denied';
            // CORREÇÃO: Usar claimed_by_staff_id
            cart.claimed_by_staff_id = interaction.user.id;
            
            const customer = await interaction.client.users.fetch(cart.user_id).catch(() => ({ tag: 'Desconhecido', displayAvatarURL: () => null }));
            const updatedPanel = generateStaffCartPanel(cart, cartItems || [], customer);
            
            if (interaction.message) {
                await interaction.message.edit(updatedPanel).catch(() => {}); // Atualiza o painel no canal
            }

            // 8. Notificar o staff
            await interaction.editReply({
                content: `✅ Pagamento de <@${cart.user_id}> recusado. O usuário foi notificado. Este canal será fechado em 10 segundos.`
            });

            // 9. Lógica de fechamento
            setTimeout(async () => {
                try {
                    const channelToClose = interaction.channel.isThread() ? interaction.channel.parent : interaction.channel;
                    if(channelToClose) {
                        await channelToClose.delete('Venda cancelada pelo staff.');
                    }
                } catch (e) {
                    console.error(`[Store Deny] Falha ao deletar canal ${cartChannelId}:`, e);
                }
            }, 10000);

        } catch (error) {
            console.error('[store_staff_deny_payment] Erro ao recusar pagamento:', error);
            await interaction.editReply({
                content: 'Ocorreu um erro interno ao tentar recusar este pagamento. Verifique os logs.'
            }).catch(() => {});
        }
    }
};