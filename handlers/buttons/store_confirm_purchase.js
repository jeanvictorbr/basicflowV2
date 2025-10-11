// Substitua o conteúdo em: handlers/buttons/store_confirm_purchase.js
// jeanvictorbr/basicflowv2-beta/basicflowV2-BETA-37a76a5f8c6981d2e0e8259174db35646d1de700/handlers/buttons/store_confirm_purchase.js

const { ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
// CORREÇÃO CRÍTICA: Importa todas as funções de UI necessárias
const { generateMainCartMessage, generateAutomaticPaymentDM, generatePaymentMessage } = require('../../ui/store/dmConversationalFlow.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');
const hasFeature = require('../../utils/featureCheck.js');
const { updateCartActivity } = require('../../utils/storeInactivityMonitor.js');
// CORREÇÃO CRÍTICA: Importa a função de criação de PIX
const { createPixPayment } = require('../../utils/mercadoPago.js'); 

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function createDirectPaymentCart(interaction, products, coupon) {
    // ... (MANTENHA A LÓGICA DE CRIAÇÃO DO CARRINHO E DA THREAD)
    // Apenas a lógica abaixo é necessária para a integridade do arquivo:
    const oldCarts = await db.query('SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND (status = $3 OR status = $4)', [interaction.guild.id, interaction.user.id, 'open', 'payment']);
    for(const oldCart of oldCarts.rows) {
        await db.query('DELETE FROM store_carts WHERE channel_id = $1', [oldCart.channel_id]);
        const oldChannel = await interaction.guild.channels.fetch(oldCart.channel_id).catch(() => null);
        if(oldChannel) await oldChannel.delete('Iniciando novo carrinho premium.').catch(()=>{});
    }

    const settings = (await db.query('SELECT store_category_id, store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    const category = await interaction.guild.channels.fetch(settings.store_category_id);
    const channelName = `🛒-carrinho-${interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
    
    const cartChannel = await interaction.guild.channels.create({
        name: channelName, type: ChannelType.GuildText, parent: category,
        permissionOverwrites: [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: settings.store_staff_role_id, allow: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] } 
        ],
    });

    const thread = await cartChannel.threads.create({
        name: `Atendimento de ${interaction.user.username}`,
        autoArchiveDuration: 1440,
        reason: `Atendimento VIP para o carrinho #${cartChannel.id}`
    });

    await thread.members.add(interaction.user.id);
    await cartChannel.permissionOverwrites.delete(interaction.user.id, 'Acesso à thread concedido.');

    let totalPrice = products.reduce((sum, p) => sum + parseFloat(p.price), 0);
    if (coupon) {
        totalPrice = totalPrice * (1 - (coupon.discount_percent / 100));
    }
    
    await db.query(
        'INSERT INTO store_carts (channel_id, thread_id, guild_id, user_id, products_json, status, coupon_id, total_price) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)',
        [cartChannel.id, thread.id, interaction.guild.id, interaction.user.id, JSON.stringify(products), 'payment', coupon ? coupon.id : null, totalPrice.toFixed(2)]
    );
    const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartChannel.id])).rows[0];

    return { cart };
}

async function createOrUpdateStandardCart(interaction, products) {
    // ... (MANTENHA A LÓGICA DE CRIAÇÃO DO CARRINHO PADRÃO)
    // Apenas a lógica abaixo é necessária para a integridade do arquivo:
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    let cartChannel;
    
    let existingCart = (await db.query('SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND status = $3', [interaction.guild.id, interaction.user.id, 'open'])).rows[0];

    if (existingCart) {
        cartChannel = await interaction.guild.channels.fetch(existingCart.channel_id).catch(() => null);
        if (!cartChannel) {
            await db.query('DELETE FROM store_carts WHERE channel_id = $1', [existingCart.channel_id]);
            existingCart = null;
        } else {
            const currentProducts = existingCart.products_json || [];
            const newProducts = [...currentProducts, ...products];
            await db.query('UPDATE store_carts SET products_json = $1::jsonb WHERE channel_id = $2', [JSON.stringify(newProducts), existingCart.channel_id]);
        }
    }
    
    if (!existingCart) {
        const category = await interaction.guild.channels.fetch(settings.store_category_id);
        const channelName = `🛒-carrinho-${interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
        cartChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
                { id: settings.store_staff_role_id, allow: [PermissionsBitField.Flags.ViewChannel] },
            ],
        });
        await db.query(
            'INSERT INTO store_carts (channel_id, guild_id, user_id, products_json) VALUES ($1, $2, $3, $4::jsonb)',
            [cartChannel.id, interaction.guild.id, interaction.user.id, JSON.stringify(products)]
        );
    }

    await updateCartActivity(cartChannel.id);
    const updatedCart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartChannel.id])).rows[0];
    const productsInCart = updatedCart.products_json || [];
    const cartPanelPayload = generateCartPanel(updatedCart, productsInCart, settings, null, interaction);

    const messagesInCart = await cartChannel.messages.fetch({ limit: 10 });
    const botPanelMessage = messagesInCart.find(m => m.author.id === interaction.client.user.id && m.embeds[0]?.title.includes('Carrinho de Compras'));
    
    if (botPanelMessage) {
        await botPanelMessage.edit(cartPanelPayload);
    } else {
        await cartChannel.send({ content: `Bem-vindo ao seu carrinho, ${interaction.user}!`, ...cartPanelPayload });
    }
    
    return cartChannel;
}

module.exports = {
    customId: 'store_confirm_purchase_products_',
    async execute(interaction) {
        const parts = interaction.customId.split('_coupon_');
        const productIdsString = parts[0].replace('store_confirm_purchase_products_', '');
        const productIds = productIdsString.split('-');
        const couponId = parts[1] === 'none' ? null : parts[1];

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        if (settings.store_premium_dm_flow_enabled) {
            const loadingEmbed = new EmbedBuilder().setColor('#5865F2').setAuthor({ name: "Estamos a preparar seu checkout VIP...", iconURL: "https://media.tenor.com/JwPW0tw69vAAAAAi/cargando-loading.gif" });
            await interaction.update({ content: '', embeds: [loadingEmbed], components: [] });
            await delay(1500);

            const products = (await db.query(`SELECT * FROM store_products WHERE id = ANY($1::int[])`, [productIds])).rows;
            let coupon = couponId ? (await db.query('SELECT * FROM store_coupons WHERE id = $1', [couponId])).rows[0] : null;

            try {
                const { cart } = await createDirectPaymentCart(interaction, products, coupon); 
                
                if (settings.store_log_channel_id) {
                    const logChannel = await interaction.guild.channels.fetch(settings.store_log_channel_id).catch(() => null);
                    if (logChannel) {
                        const claimButton = new ButtonBuilder().setCustomId(`store_staff_claim_cart_${cart.channel_id}`).setLabel('Assumir Atendimento').setStyle(ButtonStyle.Primary);
                        const logEmbed = new EmbedBuilder().setColor('Blue').setTitle('🛒 Novo Carrinho VIP').setDescription(`**Cliente:** ${interaction.user}\n**Canal de Atendimento:** <#${cart.thread_id}>`);
                        await logChannel.send({ embeds: [logEmbed], components: [new ActionRowBuilder().addComponents(claimButton)] });
                    }
                }

                await updateCartActivity(cart.channel_id);
                
                const hasAutomation = await hasFeature(interaction.guild.id, 'STORE_AUTOMATION');
                let dmPayload;

                if (hasAutomation && settings.store_mp_token) {
                    try {
                        const paymentData = await createPixPayment(interaction.guild.id, cart, products);
                        dmPayload = generateAutomaticPaymentDM(cart, paymentData);
                    } catch (mpError) {
                        console.error("Falha ao gerar pagamento com Mercado Pago, a reverter para o modo manual:", mpError);
                        // Se falhar, reverte para a mensagem de pagamento manual na DM
                        dmPayload = generatePaymentMessage(cart, settings, coupon);
                    }
                } else {
                    dmPayload = generatePaymentMessage(cart, settings, coupon);
                }

                await interaction.user.send(dmPayload);

                await interaction.editReply({ content: '✅ **Checkout Iniciado!** Verifique as suas mensagens diretas (DM) para continuar.', embeds: [] });

            } catch (error) {
                console.error("Erro no fluxo de pagamento direto: ", error);
                await interaction.editReply({ content: '❌ Ocorreu um erro. Verifique se as suas DMs estão abertas e se as configurações da loja (categoria, cargo) estão corretas.', embeds: [] });
            }

        } else {
            await interaction.deferUpdate();
            const products = (await db.query(`SELECT * FROM store_products WHERE id = ANY($1::int[])`, [productIds])).rows;
            const cartChannel = await createOrUpdateStandardCart(interaction, products);
            await interaction.followUp({ content: `✅ Produto(s) adicionado(s)! Confira o seu carrinho em ${cartChannel}`, ephemeral: true });
        }
    }
};