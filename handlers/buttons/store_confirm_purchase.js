/*
 * Caminho: handlers/buttons/store_confirm_purchase.js
 * Descrição: Arquivo COMPLETO E ATUALIZADO.
 *
 * Alteração (Cirúrgica):
 * 1. (Função createOrUpdateStandardCart): Adicionada uma verificação
 * (interaction.guild.roles.fetch) para garantir que o 'staffRoleId'
 * salvo no banco de dados ainda existe no servidor antes de usá-lo
 * nas 'permissionOverwrites'. Isso corrige o crash 'InvalidType'.
 */
const { V2_FLAG, EPHEMERAL_FLAG, buildEmbed } = require('../../utils/constants.js');
const db = require('../../database.js');
const { PermissionsBitField, ChannelType } = require('discord.js');
const getCartPanel = require('../../ui/store/cartPanel.js');
const getStaffCartPanel = require('../../ui/store/staffCartPanel.js');
const storeLog = require('../../utils/loggers/storeLog.js');
const getDMCartPanel = require('../../ui/store/dmConversationalFlow.js');

// Função auxiliar para criar/atualizar carrinhos padrão (em canais)
async function createOrUpdateStandardCart(interaction, client, guildId, userId, settings, products, totalPrice, coupon) {
    const existingCart = (await db.query("SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND status = 'open'", [guildId, userId])).rows[0];

    let cart;
    let channel;

    if (existingCart && existingCart.channel_id) {
        // --- Carrinho existente encontrado ---
        channel = await client.channels.fetch(existingCart.channel_id).catch(() => null);
        
        if (!channel) {
             // O canal foi deletado, mas o carrinho ainda existe no DB. Limpar e recriar.
             await db.query('DELETE FROM store_cart_items WHERE cart_id = $1', [existingCart.cart_id]);
             await db.query('DELETE FROM store_carts WHERE cart_id = $1', [existingCart.cart_id]);
             // Continua para a lógica de criação abaixo
        } else {
            // Atualiza o carrinho existente
            cart = existingCart;
            await db.query('UPDATE store_carts SET total_price = $1, coupon_code = $2 WHERE cart_id = $3', [totalPrice, coupon?.code, cart.cart_id]);
            
            // Limpa itens antigos e insere novos
            await db.query('DELETE FROM store_cart_items WHERE cart_id = $1', [cart.cart_id]);
            for (const product of products) {
                await db.query('INSERT INTO store_cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [cart.cart_id, product.product_id, product.quantity, product.price]);
            }
            return { cart, channel };
        }
    }

    // --- Se não houver carrinho ou o canal foi deletado, criar um novo ---
    
    // Preparar permissões
    const staffRoleId = settings.staff_role_id;
    const logChannelId = settings.log_channel_id;

    let permissionOverwrites = [
        {
            id: guildId, // @everyone
            deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
            id: userId, // O comprador
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles],
        },
        {
            id: client.user.id, // O Bot
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.ManageChannels],
        }
    ];

    // --- INÍCIO DA CORREÇÃO ---
    // Verifica se o cargo de staff existe ANTES de adicioná-lo
    if (staffRoleId) {
        const staffRole = await interaction.guild.roles.fetch(staffRoleId).catch(() => null);
        if (staffRole) {
            permissionOverwrites.push({
                id: staffRoleId,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles],
            });
        } else {
            console.warn(`[Store] O cargo de staff (ID: ${staffRoleId}) está configurado no DB, mas não foi encontrado no servidor ${guildId}. O carrinho foi criado sem ele.`);
            // Opcional: Notificar o log de que o cargo de staff não foi encontrado
            if(logChannelId) {
                const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
                if(logChannel) await logChannel.send(`⚠️ **Alerta de Configuração da Loja:** O cargo de Staff (ID: \`${staffRoleId}\`) não foi encontrado. Carrinhos criados não serão visíveis para a staff até que o cargo seja reconfigurado.`);
            }
        }
    }
    // --- FIM DA CORREÇÃO ---

    // Criar o canal do carrinho
    channel = await interaction.guild.channels.create({
        name: `🛒-carrinho-${interaction.user.username}`,
        type: ChannelType.GuildText,
        topic: `Carrinho de ${interaction.user.tag} (ID: ${userId}). Total: R$ ${totalPrice.toFixed(2)}.`,
        parent: settings.cart_category_id || null, // Usar null se a categoria não estiver definida
        permissionOverwrites: permissionOverwrites,
    });

    // Inserir o novo carrinho no DB
    const cartInsertQuery = await db.query(
        'INSERT INTO store_carts (guild_id, user_id, channel_id, status, total_price, coupon_code, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING cart_id',
        [guildId, userId, channel.id, 'open', totalPrice, coupon?.code, new Date()]
    );
    cart = { cart_id: cartInsertQuery.rows[0].cart_id };

    // Inserir os itens do carrinho
    for (const product of products) {
        await db.query('INSERT INTO store_cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [cart.cart_id, product.product_id, product.quantity, product.price]);
    }

    return { cart, channel };
}


// Função auxiliar para criar/atualizar carrinhos DM (via DM)
async function createOrUpdateDMCart(interaction, client, guildId, userId, settings, products, totalPrice, coupon) {
     const existingCart = (await db.query("SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND status = 'open' AND thread_id IS NOT NULL", [guildId, userId])).rows[0];

    let cart;
    let thread;

    if (existingCart) {
        // --- Carrinho existente encontrado ---
        cart = existingCart;
        await db.query('UPDATE store_carts SET total_price = $1, coupon_code = $2 WHERE cart_id = $3', [totalPrice, coupon?.code, cart.cart_id]);
        
        // Limpa itens antigos e insere novos
        await db.query('DELETE FROM store_cart_items WHERE cart_id = $1', [cart.cart_id]);
        for (const product of products) {
            await db.query('INSERT INTO store_cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [cart.cart_id, product.product_id, product.quantity, product.price]);
        }
        return { cart, thread: null }; // Retorna null pois o canal/thread já existe
    }

    // --- Criar um novo carrinho DM ---
    const logChannelId = settings.log_channel_id;
    const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
    if (!logChannel) {
        throw new Error('Canal de logs da loja (DM Flow) não configurado ou não encontrado.');
    }

    // Criar o novo carrinho no DB
    const cartInsertQuery = await db.query(
        'INSERT INTO store_carts (guild_id, user_id, status, total_price, coupon_code, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING cart_id',
        [guildId, userId, 'open', totalPrice, coupon?.code, new Date()]
    );
    cart = { cart_id: cartInsertQuery.rows[0].cart_id };
    const cartId = cart.cart_id;

    // Inserir os itens do carrinho
    for (const product of products) {
        await db.query('INSERT INTO store_cart_items (cart_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [cartId, product.product_id, product.quantity, product.price]);
    }
     
    // Criar a thread no canal de logs
    try {
        const staffPanel = await getStaffCartPanel(client, guildId, cartId, userId, products, totalPrice, coupon, 'dm_flow');
        const message = await logChannel.send({
            content: `Novo carrinho (via DM) de <@${userId}> (ID: \`${userId}\`)`,
            embeds: staffPanel.embeds,
            components: staffPanel.components
        });

        thread = await message.startThread({
            name: `🛒-dm-${interaction.user.username}`,
            autoArchiveDuration: 1440, // 24 horas
            reason: `Carrinho DM ${cartId} de ${interaction.user.tag}`
        });

        // Atualizar o carrinho no DB com o ID da thread
        await db.query('UPDATE store_carts SET thread_id = $1 WHERE cart_id = $2', [thread.id, cartId]);

    } catch (e) {
        console.error("[Store DM Flow] Erro ao criar thread para o carrinho:", e);
        // Se falhar, deleta o carrinho para evitar órfãos
        await db.query('DELETE FROM store_cart_items WHERE cart_id = $1', [cartId]);
        await db.query('DELETE FROM store_carts WHERE cart_id = $1', [cartId]);
        throw new Error('Falha ao criar a thread de atendimento para o carrinho.');
    }

    return { cart, thread };
}


module.exports = {
    customId: 'store_confirm_purchase_',
    async execute(interaction) {
        const client = interaction.client;
        const guildId = interaction.guildId;
        const userId = interaction.user.id;

        // Extrair dados do customId
        const parts = interaction.customId.split('_');
        const productIdsString = parts.find(p => p.startsWith('products')).split('-')[1];
        const couponCode = parts.find(p => p.startsWith('coupon')).split('-')[1] || 'none';
        
        const productRequests = productIdsString.split(';').map(p => ({
            id: p.split('x')[0],
            quantity: parseInt(p.split('x')[1], 10)
        }));
        
        await interaction.deferReply({ flags: EPHEMERAL_FLAG });

        try {
            const settingsQuery = await db.query('SELECT * FROM store_settings WHERE guild_id = $1', [guildId]);
            if (settingsQuery.rows.length === 0) {
                return interaction.editReply({ content: 'O sistema de loja ainda não foi configurado neste servidor.', flags: EPHEMERAL_FLAG });
            }
            const settings = settingsQuery.rows[0];

            let products = [];
            let totalPrice = 0;

            for (const req of productRequests) {
                const productQuery = await db.query('SELECT * FROM store_products WHERE product_id = $1 AND guild_id = $2', [req.id, guildId]);
                if (productQuery.rows.length > 0) {
                    const product = productQuery.rows[0];
                    products.push({ ...product, quantity: req.quantity });
                    totalPrice += product.price * req.quantity;
                }
            }

            if (products.length === 0) {
                return interaction.editReply({ content: 'Os produtos selecionados não estão mais disponíveis.', flags: EPHEMERAL_FLAG });
            }

            // Aplicar cupom
            let appliedCoupon = null;
            if (couponCode !== 'none') {
                const couponQuery = await db.query('SELECT * FROM store_coupons WHERE guild_id = $1 AND code = $2 AND (uses < max_uses OR max_uses IS NULL) AND (expires_at > NOW() OR expires_at IS NULL)', [guildId, couponCode]);
                if (couponQuery.rows.length > 0) {
                    appliedCoupon = couponQuery.rows[0];
                    const discount = totalPrice * (appliedCoupon.discount_percentage / 100);
                    totalPrice -= discount;
                }
            }
            
            // --- Fluxo de Criação de Carrinho (Padrão ou DM) ---
            if (settings.dm_flow_enabled) {
                // --- DM Cart Flow ---
                const { cart, thread } = await createOrUpdateDMCart(interaction, client, guildId, userId, settings, products, totalPrice, appliedCoupon);
                
                // Logar
                storeLog.logCartCreation(client, guildId, userId, cart.cart_id);

                // Enviar painel para a DM do usuário
                const dmPanel = await getDMCartPanel(guildId, cart.cart_id, products, totalPrice, appliedCoupon);
                try {
                    await interaction.user.send({
                        embeds: dmPanel.embeds,
                        components: dmPanel.components
                    });
                    await interaction.editReply({ content: '🛒 Seu carrinho foi criado! Verifique sua DM para continuar a compra.' });
                } catch (dmError) {
                    // Se a DM estiver fechada, deleta o carrinho e avisa
                    await db.query('DELETE FROM store_cart_items WHERE cart_id = $1', [cart.cart_id]);
                    await db.query('DELETE FROM store_carts WHERE cart_id = $1', [cart.cart_id]);
                    if (thread) await thread.delete('Usuário com DM fechada. Carrinho cancelado.');
                    
                    await interaction.editReply({ content: '❌ **Falha ao criar carrinho!** Parece que sua DM está fechada. Por favor, abra sua DM para mim e tente novamente.' });
                }

            } else {
                // --- Standard Cart Flow ---
                const { cart, channel } = await createOrUpdateStandardCart(interaction, client, guildId, userId, settings, products, totalPrice, appliedCoupon);

                // Logar
                storeLog.logCartCreation(client, guildId, userId, cart.cart_id);

                // Enviar painel de usuário no canal
                const userPanel = await getCartPanel(guildId, cart.cart_id, products, totalPrice, appliedCoupon);
                await channel.send({
                    content: `<@${userId}>`,
                    embeds: userPanel.embeds,
                    components: userPanel.components
                });
                
                // Enviar painel de staff no canal (se configurado)
                if(settings.staff_role_id) {
                     const staffPanel = await getStaffCartPanel(client, guildId, cart.cart_id, userId, products, totalPrice, appliedCoupon, 'standard');
                     await channel.send({
                        content: `<@&${settings.staff_role_id}>`,
                        embeds: staffPanel.embeds,
                        components: staffPanel.components
                    });
                }
               
                await interaction.editReply({
                    content: `🛒 Seu carrinho foi criado com sucesso! Acesse o canal <#${channel.id}> para finalizar sua compra.`
                });
            }

        } catch (error) {
            console.error('Erro ao confirmar compra e criar carrinho:', error);
            await interaction.editReply({ content: '🔴 Ocorreu um erro ao criar seu carrinho. Verifique se o bot tem permissão para criar canais nesta categoria.', flags: EPHEMERAL_FLAG });
        }
    }
};