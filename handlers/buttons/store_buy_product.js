// handlers/buttons/store_buy_product.js
const { ChannelType, PermissionsBitField, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
// NOVO: Importa o novo fluxo conversacional
const { generateMainCartMessage } = require('../../ui/store/dmConversationalFlow.js');
const hasFeature = require('../../utils/featureCheck.js');
const { updateCartActivity } = require('../../utils/storeInactivityMonitor.js');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function createOrUpdatePremiumCart(interaction, product) {
    let isNewCart = false;
    let cart;

    const existingCartResult = await db.query('SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND status = $3', [interaction.guild.id, interaction.user.id, 'open']);
    
    if (existingCartResult.rows.length > 0) {
        cart = existingCartResult.rows[0];
        const channelExists = await interaction.guild.channels.fetch(cart.channel_id).catch(() => null);
        if (!channelExists) {
            await db.query('DELETE FROM store_carts WHERE channel_id = $1', [cart.channel_id]);
            cart = null;
        } else {
             const products = cart.products_json || [];
             products.push(product);
             await db.query('UPDATE store_carts SET products_json = $1::jsonb WHERE channel_id = $2', [JSON.stringify(products), cart.channel_id]);
             cart.products_json = products; // Atualiza o objeto em memória
        }
    }
    
    if (!cart) {
        isNewCart = true;
        const settings = (await db.query('SELECT store_category_id, store_staff_role_id FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const category = await interaction.guild.channels.fetch(settings.store_category_id);
        const channelName = `🛒-carrinho-${interaction.user.username.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;
        
        const cartChannel = await interaction.guild.channels.create({
            name: channelName, type: ChannelType.GuildText, parent: category,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: settings.store_staff_role_id, allow: [PermissionsBitField.Flags.ViewChannel] },
            ],
        });
        
        await db.query(
            'INSERT INTO store_carts (channel_id, guild_id, user_id, products_json) VALUES ($1, $2, $3, $4::jsonb)',
            [cartChannel.id, interaction.guild.id, interaction.user.id, JSON.stringify([product])]
        );
        cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartChannel.id])).rows[0];
    }
    return { cart, isNewCart };
}

module.exports = {
    customId: 'store_buy_product_',
    async execute(interaction) {
        // ... (código inicial de loading, busca de produto e settings permanece o mesmo)
        const isPremium = await hasFeature(interaction.guild.id, 'STORE_PREMIUM');
        const productId = interaction.customId.split('_')[3];
        
        const loadingEmbed = new EmbedBuilder().setColor('#5865F2').setAuthor({ name: "A processar o seu pedido...", iconURL: "https://media.tenor.com/JwPW0tw69vAAAAAi/cargando-loading.gif" });
        await interaction.reply({ embeds: [loadingEmbed], ephemeral: true });

        const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
        if (!product) { return interaction.editReply({ content: '❌ Produto não encontrado.', embeds: [] }); }

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!settings.store_enabled) { return interaction.editReply({ content: '❌ A loja está desativada.', embeds: [] }); }

        if (isPremium && settings.store_premium_dm_flow_enabled) {
            loadingEmbed.setAuthor({ name: "Estamos a preparar seu assistente de compras VIP...", iconURL: "https://media.tenor.com/JwPW0tw69vAAAAAi/cargando-loading.gif" });
            await interaction.editReply({ embeds: [loadingEmbed] });
            await delay(1500);

            try {
                const { cart, isNewCart } = await createOrUpdatePremiumCart(interaction, product);
                
                // Lógica de notificação para a staff (sem alterações, já estava correta)
                if (settings.store_log_channel_id && isNewCart) {
                    const logChannel = await interaction.guild.channels.fetch(settings.store_log_channel_id).catch(() => null);
                    if (logChannel) {
                        const claimButton = new ButtonBuilder().setCustomId(`store_staff_claim_cart_${cart.channel_id}`).setLabel('Assumir Atendimento').setStyle(ButtonStyle.Primary);
                        const logEmbed = new EmbedBuilder().setColor('Blue').setTitle('🛒 Novo Carrinho VIP').setDescription(`**Cliente:** ${interaction.user}`);
                        await logChannel.send({ embeds: [logEmbed], components: [new ActionRowBuilder().addComponents(claimButton)] });
                    }
                }

                await updateCartActivity(cart.channel_id);
                
                // CORREÇÃO: Envia a primeira mensagem do fluxo conversacional
                const conversationalMessage = generateMainCartMessage(cart, product.name);
                await interaction.user.send(conversationalMessage);

                await interaction.editReply({ content: '✅ **Assistente Ativado!** Verifique suas mensagens diretas (DM) para continuar sua compra.', embeds: [] });

            } catch (error) {
                console.error("Erro no fluxo premium: ", error);
                await interaction.editReply({ content: '❌ Ocorreu um erro. Verifique se suas DMs estão abertas.', embeds: [] });
            }
      
            // ... (fluxo não-premium)
     
        // =================== FLUXO NÃO-PREMIUM (CANAL) =====================
        } else {
            // Seu código para o fluxo não-premium continua aqui... (sem alterações)
            loadingEmbed.setAuthor({ name: "Estamos a criar o seu carrinho...", iconURL: loadingGif });
            await interaction.editReply({ embeds: [loadingEmbed] });
            await delay(1000);

            try {
                let cartChannel;
                let existingCart = (await db.query('SELECT * FROM store_carts WHERE guild_id = $1 AND user_id = $2 AND status = $3', [interaction.guild.id, interaction.user.id, 'open'])).rows[0];
    
                if (existingCart) {
                    cartChannel = await interaction.guild.channels.fetch(existingCart.channel_id).catch(() => null);
                    if (!cartChannel) {
                        await db.query('DELETE FROM store_carts WHERE channel_id = $1', [existingCart.channel_id]);
                        existingCart = null;
                    } else {
                        const products = existingCart.products_json || [];
                        products.push(product);
                        await db.query('UPDATE store_carts SET products_json = $1::jsonb WHERE channel_id = $2', [JSON.stringify(products), existingCart.channel_id]);
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
                        [cartChannel.id, interaction.guild.id, interaction.user.id, JSON.stringify([product])]
                    );
                }
                
                await updateCartActivity(cartChannel.id);
                const updatedCartResult = await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartChannel.id]);
                const cartData = updatedCartResult.rows[0];
                const productsInCart = cartData.products_json || [];
    
                const cartPanelPayload = generateCartPanel(cartData, productsInCart, settings, null);
    
                const messagesInCart = await cartChannel.messages.fetch({ limit: 10 });
                const botPanelMessage = messagesInCart.find(m => m.author.id === interaction.client.user.id && m.embeds.length > 0 && m.embeds[0].title.includes('Carrinho de Compras'));
                
                if (botPanelMessage) {
                    await botPanelMessage.edit(cartPanelPayload);
                } else {
                    await cartChannel.send({ content: `Bem-vindo ao seu carrinho, ${interaction.user}!`, ...cartPanelPayload });
                }
    
                await interaction.editReply({ content: `✅ Produto adicionado! Confira seu carrinho em ${cartChannel}`, embeds: [] });
    
            } catch (error) {
                console.error('[Store] Erro ao criar/atualizar carrinho (não-premium):', error);
                await interaction.editReply({ content: '❌ Ocorreu um erro ao processar sua compra. Por favor, contate um administrador.', embeds: [] });
            }
        }
    }
};