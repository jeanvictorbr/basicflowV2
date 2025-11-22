// utils/approvePurchase.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
const { logEvent } = require('./webhookLogger.js'); 
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

        let deliveredItemsContent = []; // Para DMs de 'REAL'
        let deliveredRoles = []; // Para DMs de 'role'
        let productDetailsForLog = []; // Para o log final

        // --- NOVA ADIÇÃO: Rastrear categorias afetadas para atualizar vitrine ---
        const affectedCategories = new Set();
        // -----------------------------------------------------------------------

        // --- INÍCIO DA LÓGICA DE DURAÇÃO (PARA O CARGO DE CLIENTE) ---
        let maxDuration = 0;
        let hasPermanentProductRole = false;
        // --- FIM DA LÓGICA ---

        // Agrupa produtos idênticos para entrega
        const productSummary = new Map();
        for (const item of productsInCart) {
            productSummary.set(item.id, (productSummary.get(item.id) || 0) + 1);
        }

        for (const [productId, quantity] of productSummary.entries()) {
            const product = (await client_db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            
            // [MODIFICAÇÃO] Criamos o objeto antes para poder popular o 'delivered_content' depois
            let logItem = { 
                name: product ? product.name : `[Produto Deletado ID: ${productId}]`, 
                quantity: quantity, 
                price: product ? product.price : 0,
                delivered_content: [] // <-- AQUI SERÃO SALVAS AS KEYS
            };

            if (!product) {
                productDetailsForLog.push(logItem);
                continue;
            }

            // Adiciona categoria à lista de atualização
            if (product.category_id) affectedCategories.add(product.category_id);

            // Adicionamos o objeto (referência) ao array principal
            productDetailsForLog.push(logItem);

            // 1. Entrega de Cargo
            if (product.role_id_to_grant) {
                const role = await guild.roles.fetch(product.role_id_to_grant).catch(() => null);
                if (role) {
                    await member.roles.add(role, 'Compra na Loja BasicFlow');
                    deliveredRoles.push(role.name);
                    
                    // Lógica de expiração
                    if (product.role_duration_days && product.role_duration_days > 0) {
                        await client_db.query(`
                            INSERT INTO store_user_roles_expiration (guild_id, user_id, role_id, expires_at)
                            VALUES ($1, $2, $3, NOW() + INTERVAL '${product.role_duration_days} days')
                            ON CONFLICT (guild_id, user_id, role_id)
                            DO UPDATE SET expires_at = NOW() + INTERVAL '${product.role_duration_days} days';
                        `, [guildId, member.id, role.id]);
                        
                        // --- LÓGICA DE DURAÇÃO (PARA O CARGO DE CLIENTE) ---
                        if (product.role_duration_days > maxDuration) {
                            maxDuration = product.role_duration_days;
                        }
                        // --- FIM DA LÓGICA ---
                    } else {
                        // --- LÓGICA DE DURAÇÃO (PARA O CARGO DE CLIENTE) ---
                        hasPermanentProductRole = true; // Marcou que tem um cargo permanente
                        // --- FIM DA LÓGICA ---
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
                        
                        // [MODIFICAÇÃO] Salva a key também no log para recuperação futura
                        logItem.delivered_content.push(stockItem.content);
                    }
                    deliveredItemsContent.push(`**${product.name} (x${quantity})**:\n\`\`\`\n${deliveredContent.join('\n')}\n\`\`\``);
                    
                    // Atualiza a contagem de estoque
                    await client_db.query('UPDATE store_products SET stock = stock - $1 WHERE id = $2', [quantity, product.id]);
                } else {
                    // Sem estoque! Loga o erro.
                    if(logChannel) await logChannel.send(`⚠️ **FALHA NA ENTREGA (SEM ESTOQUE)!**\nProduto: \`${product.name}\` (ID: ${product.id})\nCliente: ${member}\nPedido: ${quantity} / Disponível: ${stockItems.length}\nO item foi pago mas não pôde ser entregue.`);
                    deliveredItemsContent.push(`**${product.name} (x${quantity})**: \`ERRO: Sem estoque! Um admin foi notificado.\``);
                }
            }
        }
        
        // --- INÍCIO DA CORREÇÃO (CARGO DE CLIENTE TEMPORÁRIO) ---
        // 3. Cargo de Cliente
        if (settings.store_client_role_id) {
            const clientRole = await guild.roles.fetch(settings.store_client_role_id).catch(() => null);
            if (clientRole) {
                await member.roles.add(clientRole, 'Cliente do StoreFlow');
                
                // Se o usuário NÃO comprou nenhum cargo permanente E comprou PELO MENOS UM cargo temporário
                // O cargo de cliente vai expirar junto com o cargo temporário mais longo
                if (!hasPermanentProductRole && maxDuration > 0) {
                     await client_db.query(`
                        INSERT INTO store_user_roles_expiration (guild_id, user_id, role_id, expires_at)
                        VALUES ($1, $2, $3, NOW() + INTERVAL '${maxDuration} days')
                        ON CONFLICT (guild_id, user_id, role_id)
                        DO UPDATE SET expires_at = NOW() + INTERVAL '${maxDuration} days';
                    `, [guildId, member.id, clientRole.id]); // Adiciona o CARGO DE CLIENTE na expiração
                }
            }
        }
        // --- FIM DA CORREÇÃO ---


        // 4. Enviar DMs de entrega
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
        await client_db.query("UPDATE store_carts SET status = 'delivered', claimed_by_staff_id = $1 WHERE channel_id = $2", [staffId, cartChannelId]);
        await client_db.query(
            "INSERT INTO store_sales_log (guild_id, user_id, total_amount, product_details, status, created_at) VALUES ($1, $2, $3, $4::jsonb, 'completed', NOW())",
            [guildId, member.id, cart.total_price, JSON.stringify(productDetailsForLog)]
        );
        
        // 6. Logar no canal privado
        const logEmbed = new EmbedBuilder()
            .setTitle('✅ Venda Aprovada')
            .setColor('Green')
            .setDescription(`**Cliente:** ${member} (\`${member.id}\`)\n**Atendente:** <@${staffId}>\n**Valor:** \`R$ ${cart.total_price}\`\n**ID Carrinho:** \`${cart.channel_id}\``)
            .addFields({ name: 'Itens Entregues', value: productDetailsForLog.map(p => `• ${p.quantity}x ${p.name}`).join('\n') })
            .setTimestamp();
        if(logChannel) await logChannel.send({ embeds: [logEmbed] });

        // 7. Logar no canal público (Estilo solicitado)
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

        // 8. ATUALIZAR AS VITRINES DAS CATEGORIAS AFETADAS
        // Agora percorremos o Set de IDs e atualizamos apenas as necessárias
        if (affectedCategories.size > 0) {
            for (const catId of affectedCategories) {
                try {
                    await updateStoreVitrine(client, guildId, catId);
                } catch (vitrineError) {
                    console.error(`[ApprovePurchase] Falha ao atualizar a vitrine da categoria ${catId}:`, vitrineError);
                }
            }
        } else {
            // Fallback para vitrine global se nenhuma categoria específica for detectada (compatibilidade)
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