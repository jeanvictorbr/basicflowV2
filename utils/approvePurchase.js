// utils/approvePurchase.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function approvePurchase(client, guildId, cartChannelId, staffMember = null) {
    const client_db = await db.getClient();
    try {
        await client_db.query('BEGIN');

        // Trava o carrinho para evitar processamento duplicado
        const cartResult = await client_db.query("SELECT * FROM store_carts WHERE channel_id = $1 AND status != 'delivered' FOR UPDATE", [cartChannelId]);
        if (cartResult.rows.length === 0) {
            await client_db.query('ROLLBACK');
            return { success: false, error: 'Carrinho não encontrado ou já processado.' };
        }
        const cart = cartResult.rows[0];
        const productsInCart = cart.products_json || [];

        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(cart.user_id).catch(() => null);
        if (!member) {
            await client_db.query('ROLLBACK');
            return { success: false, error: 'Membro não encontrado no servidor.' };
        }

        const settings = (await client_db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0] || {};
        const staffId = staffMember ? staffMember.id : client.user.id; // Se for nulo (automático), usa o ID do Bot
        const logChannel = settings.store_log_channel_id ? await guild.channels.fetch(settings.store_log_channel_id).catch(() => null) : null;
        const publicLogChannel = settings.store_public_log_channel_id ? await guild.channels.fetch(settings.store_public_log_channel_id).catch(() => null) : null;

        let deliveredItemsContent = []; 
        let deliveredRoles = []; 
        let productDetailsForLog = []; 
        const affectedCategories = new Set();

        // Variáveis para recálculo seguro do preço
        let calculatedTotal = 0;

        let maxDuration = 0;
        let hasPermanentProductRole = false;

        // Agrupa produtos idênticos para entrega
        const productSummary = new Map();
        for (const item of productsInCart) {
            productSummary.set(item.id, (productSummary.get(item.id) || 0) + 1);
        }

        for (const [productId, quantity] of productSummary.entries()) {
            const product = (await client_db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            
            let logItem = { 
                name: product ? product.name : `[Produto Deletado ID: ${productId}]`, 
                quantity: quantity, 
                price: product ? product.price : 0,
                delivered_content: [] 
            };

            if (!product) {
                productDetailsForLog.push(logItem);
                continue;
            }

            // CORREÇÃO 1: Somar ao total calculado para garantir que não seja nulo
            calculatedTotal += parseFloat(product.price) * quantity;

            if (product.category_id) affectedCategories.add(product.category_id);
            productDetailsForLog.push(logItem);

            // 1. Entrega de Cargo
            if (product.role_id_to_grant) {
                const role = await guild.roles.fetch(product.role_id_to_grant).catch(() => null);
                if (role) {
                    await member.roles.add(role, 'Compra na Loja BasicFlow');
                    deliveredRoles.push(role.name);
                    
                    if (product.role_duration_days && product.role_duration_days > 0) {
                        await client_db.query(`
                            INSERT INTO store_user_roles_expiration (guild_id, user_id, role_id, expires_at)
                            VALUES ($1, $2, $3, NOW() + INTERVAL '${product.role_duration_days} days')
                            ON CONFLICT (guild_id, user_id, role_id)
                            DO UPDATE SET expires_at = NOW() + INTERVAL '${product.role_duration_days} days';
                        `, [guildId, member.id, role.id]);
                        
                        if (product.role_duration_days > maxDuration) {
                            maxDuration = product.role_duration_days;
                        }
                    } else {
                        hasPermanentProductRole = true; 
                    }
                }
            }

            // 2. Entrega de Estoque Real
            if (product.stock_type === 'REAL') {
                const stockItems = (await client_db.query(
                    "SELECT id, content FROM store_stock WHERE product_id = $1 AND is_claimed = false ORDER BY id ASC LIMIT $2 FOR UPDATE",
                    [product.id, quantity]
                )).rows;
                
                if (stockItems.length >= quantity) {
                    let deliveredContent = [];
                    for (const stockItem of stockItems) {
                        await client_db.query('UPDATE store_stock SET is_claimed = true, claimed_by_user_id = $1, claimed_at = NOW() WHERE id = $2', [member.id, stockItem.id]);
                        deliveredContent.push(stockItem.content);
                        logItem.delivered_content.push(stockItem.content);
                    }
                    deliveredItemsContent.push(`**${product.name} (x${quantity})**:\n\`\`\`\n${deliveredContent.join('\n')}\n\`\`\``);
                    await client_db.query('UPDATE store_products SET stock = stock - $1 WHERE id = $2', [quantity, product.id]);
                } else {
                    if(logChannel) await logChannel.send(`⚠️ **FALHA NA ENTREGA (SEM ESTOQUE)!**\nProduto: \`${product.name}\` (ID: ${product.id})\nCliente: ${member}\nPedido: ${quantity} / Disponível: ${stockItems.length}\nO item foi pago mas não pôde ser entregue.`);
                    deliveredItemsContent.push(`**${product.name} (x${quantity})**: \`ERRO: Sem estoque! Um admin foi notificado.\``);
                }
            }
        }
        
        // CORREÇÃO 2: Aplicar desconto do cupom se houver (no cálculo seguro)
        if (cart.coupon_id) {
            const couponRes = await client_db.query('SELECT discount_percent FROM store_coupons WHERE id = $1', [cart.coupon_id]);
            if (couponRes.rows.length > 0) {
                const discount = (calculatedTotal * couponRes.rows[0].discount_percent) / 100;
                calculatedTotal -= discount;
            }
        }

        // Formata o total final para string com 2 casas decimais (evita null)
        const finalTotalToSave = Math.max(0, calculatedTotal).toFixed(2);

        // 3. Cargo de Cliente
        if (settings.store_client_role_id) {
            const clientRole = await guild.roles.fetch(settings.store_client_role_id).catch(() => null);
            if (clientRole) {
                await member.roles.add(clientRole, 'Cliente do StoreFlow');
                if (!hasPermanentProductRole && maxDuration > 0) {
                     await client_db.query(`
                        INSERT INTO store_user_roles_expiration (guild_id, user_id, role_id, expires_at)
                        VALUES ($1, $2, $3, NOW() + INTERVAL '${maxDuration} days')
                        ON CONFLICT (guild_id, user_id, role_id)
                        DO UPDATE SET expires_at = NOW() + INTERVAL '${maxDuration} days';
                    `, [guildId, member.id, clientRole.id]); 
                }
            }
        }

        // 4. Enviar DMs
        if (deliveredItemsContent.length > 0) {
            await member.send(`🎉 **Sua entrega de ${guild.name} chegou!**\n\nObrigado por sua compra. Aqui estão seus produtos:\n\n${deliveredItemsContent.join('\n\n')}`).catch(() => {
                if(logChannel) logChannel.send(`⚠️ Falha ao enviar DM de entrega de estoque para ${member}.`);
            });
        }
        if (deliveredRoles.length > 0) {
            await member.send(`🎉 **Cargos Ativados em ${guild.name}!**\n\nVocê recebeu o(s) seguinte(s) cargo(s):\n- ${deliveredRoles.join('\n- ')}`).catch(() => {
                if(logChannel) logChannel.send(`⚠️ Falha ao enviar DM de entrega de cargos para ${member}.`);
            });
        }

        // 5. Atualizar Carrinho e Logar Venda
        // CORREÇÃO 3: Usar 'finalTotalToSave' em vez de 'cart.total_price' (que pode ser null)
        await client_db.query("UPDATE store_carts SET status = 'delivered', claimed_by_staff_id = $1, total_price = $3 WHERE channel_id = $2", [staffId, cartChannelId, finalTotalToSave]);
        
        await client_db.query(
            "INSERT INTO store_sales_log (guild_id, user_id, total_amount, product_details, status, created_at) VALUES ($1, $2, $3, $4::jsonb, 'completed', NOW())",
            [guildId, member.id, finalTotalToSave, JSON.stringify(productDetailsForLog)]
        );
        
        // 6. Logar no canal privado
        const logEmbed = new EmbedBuilder()
            .setTitle('✅ Venda Aprovada')
            .setColor('Green')
            // CORREÇÃO 4: Exibir o preço calculado no Embed
            .setDescription(`**Cliente:** ${member} (\`${member.id}\`)\n**Atendente:** <@${staffId}>\n**Valor:** \`R$ ${finalTotalToSave}\`\n**ID Carrinho:** \`${cart.channel_id}\``)
            .addFields({ name: 'Itens Entregues', value: productDetailsForLog.map(p => `• ${p.quantity}x ${p.name}`).join('\n') })
            .setTimestamp();
        if(logChannel) await logChannel.send({ embeds: [logEmbed] });

        // 7. Logar no canal público
        if(publicLogChannel) {
            const productListString = productDetailsForLog.map(p => `• ${p.quantity}x ${p.name}`).join('\n');
            const descriptionComBarra = `> ${member} acaba de adquirir seus produtos!\n> Agradecemos a preferência!`;

            const publicEmbed = new EmbedBuilder()
                .setTitle('🎉 Nova Compra Aprovada!')
                .setColor('Gold') 
                .setAuthor({ name: 'Vitrine de Produtos 🏪' }) 
                .setThumbnail(member.displayAvatarURL()) 
                .setDescription(descriptionComBarra) 
                .addFields(
                    { name: '🛒 Produtos Adquiridos', value: productListString || '> Nenhum' } 
                )
                .setFooter({ text: 'Venha comprar você também!' })
                .setTimestamp();
            
            await publicLogChannel.send({ embeds: [publicEmbed] });
        }

        await client_db.query('COMMIT');

        // 8. Atualizar Vitrines
        if (affectedCategories.size > 0) {
            for (const catId of affectedCategories) {
                try {
                    await updateStoreVitrine(client, guildId, catId);
                } catch (vitrineError) {
                    console.error(`[ApprovePurchase] Falha ao atualizar a vitrine da categoria ${catId}:`, vitrineError);
                }
            }
        } else {
            try {
                await updateStoreVitrine(client, guildId);
            } catch (e) {}
        }

        return { success: true };

    } catch (error) {
        await client_db.query('ROLLBACK');
        console.error(`[ApprovePurchase] Erro fatal ao aprovar ${cartChannelId}:`, error);
        return { success: false, error: error.message };
    } finally {
        client_db.release();
    }
}

module.exports = { approvePurchase };