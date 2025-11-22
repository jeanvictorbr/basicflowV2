// Arquivo: handlers/buttons/store_confirm_purchase.js
const { ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { generateMainCartMessage, generateAutomaticPaymentDM, generatePaymentMessage } = require('../../ui/store/dmConversationalFlow.js');
const generateCartPanel = require('../../ui/store/cartPanel.js');
const hasFeature = require('../../utils/featureCheck.js');
const { updateCartActivity } = require('../../utils/storeInactivityMonitor.js');
const { createPixPayment } = require('../../utils/mercadoPago.js'); 

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// --- FUNÇÕES AUXILIARES ---

async function createDirectPaymentCart(interaction, products, coupon) {
    // Limpa carrinhos antigos
    const oldCarts = await db.query('SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND (status = $3 OR status = $4)', [interaction.guild.id, interaction.user.id, 'open', 'payment']);
    for(const oldCart of oldCarts.rows) {
        await db.query('DELETE FROM store_carts WHERE channel_id = $1', [oldCart.channel_id]);
        const oldChannel = await interaction.guild.channels.fetch(oldCart.channel_id).catch(() => null);
        if(oldChannel) await oldChannel.delete('Iniciando novo carrinho premium.').catch(()=>{});
    }

    const settings = (await db.query('SELECT store_category_id, store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
    const category = await interaction.guild.channels.fetch(settings.store_category_id).catch(() => null);
    const channelName = `🛒-carrinho-${interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
    
    // Monta permissões
    const permissionOverwrites = [
        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel] } 
    ];
    if (settings.store_staff_role_id) {
        permissionOverwrites.push({ id: settings.store_staff_role_id, allow: [PermissionsBitField.Flags.ViewChannel] });
    }

    const cartChannel = await interaction.guild.channels.create({
        name: channelName, 
        type: ChannelType.GuildText, 
        parent: category,
        permissionOverwrites: permissionOverwrites
    });

    const thread = await cartChannel.threads.create({
        name: `Atendimento de ${interaction.user.username}`,
        autoArchiveDuration: 1440,
        reason: `Atendimento VIP para o carrinho #${cartChannel.id}`
    });

    await thread.members.add(interaction.user.id);

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
        const category = await interaction.guild.channels.fetch(settings.store_category_id).catch(() => null);
        const channelName = `🛒-carrinho-${interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
        
        const permissionOverwrites = [
            { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
            { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
        ];
        if (settings.store_staff_role_id) {
            permissionOverwrites.push({ id: settings.store_staff_role_id, allow: [PermissionsBitField.Flags.ViewChannel] });
        }

        cartChannel = await interaction.guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: permissionOverwrites,
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
    const botPanelMessage = messagesInCart.find(m => m.author.id === interaction.client.user.id && m.embeds.length > 0 && m.embeds[0].title && m.embeds[0].title.includes('Carrinho de Compras'));
    
    if (botPanelMessage) {
        await botPanelMessage.edit(cartPanelPayload);
    } else {
        await cartChannel.send({ content: `Bem-vindo ao seu carrinho, ${interaction.user}!`, ...cartPanelPayload });
    }
    
    return cartChannel;
}

// --- HANDLER PRINCIPAL ---

module.exports = {
    customId: 'store_confirm_purchase_products_',
    async execute(interaction) {
        const parts = interaction.customId.split('_coupon_');
        const productIdsString = parts[0].replace('store_confirm_purchase_products_', '');
        const productIds = productIdsString.split('-');
        const couponId = parts[1] === 'none' ? null : parts[1];

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0] || {};
        
        if (settings.store_premium_dm_flow_enabled) {
            // FLUXO VIP (DM)
            const loadingEmbed = new EmbedBuilder().setColor('#5865F2').setAuthor({ name: "Estamos a preparar seu checkout VIP...", iconURL: "https://media.tenor.com/JwPW0tw69vAAAAAi/cargando-loading.gif" });
            // Limpa a mensagem anterior imediatamente
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
                        console.error("Falha MP:", mpError);
                        dmPayload = generatePaymentMessage(cart, settings, coupon);
                    }
                } else {
                    dmPayload = generatePaymentMessage(cart, settings, coupon);
                }
                await interaction.user.send(dmPayload);
                
                // Mensagem final no lugar do botão
                await interaction.editReply({ content: '✅ **Checkout Iniciado!** Verifique as suas mensagens diretas (DM) para continuar.', embeds: [] });

            } catch (error) {
                console.error("Erro no fluxo de pagamento direto: ", error);
                await interaction.editReply({ content: '❌ Ocorreu um erro. Verifique se as suas DMs estão abertas.', embeds: [] });
            }

        } else {
            // FLUXO PADRÃO (Criação de Canal)
            
            // 1. Update Imediato: Remove a Embed azul e o botão de confirmar, mostrando um "Carregando"
            await interaction.update({ 
                content: '🔄 **Processando pedido...**', 
                embeds: [], 
                components: [] 
            });

            try {
                const products = (await db.query(`SELECT * FROM store_products WHERE id = ANY($1::int[])`, [productIds])).rows;
                const cartChannel = await createOrUpdateStandardCart(interaction, products);
                
                // 2. EditReply: Substitui o "Carregando" pelo link final do carrinho
                await interaction.editReply({ 
                    content: `✅ **Sucesso!** Produto adicionado.\n🛒 **Vá para:** ${cartChannel}` 
                });

            } catch (error) {
                console.error("Erro ao criar carrinho padrão:", error);
                await interaction.editReply({ content: '❌ Erro ao criar carrinho. Verifique as permissões do bot.' });
            }
        }
    }
};