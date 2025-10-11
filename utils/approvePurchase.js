// utils/approvePurchase.js
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function approvePurchase(client, guildId, cartId) {
    const guild = await client.guilds.fetch(guildId).catch(() => null);
    if (!guild) {
        console.error(`[Approve Purchase] Guild ${guildId} não encontrada.`);
        return { success: false, message: 'Guilda não encontrada.' };
    }

    const cart = (await db.query('SELECT * FROM store_carts WHERE channel_id = $1', [cartId])).rows[0];
    if (!cart) {
        return { success: false, message: 'Carrinho não encontrado.' };
    }
    if (cart.status === 'completed') {
        return { success: true, message: 'Esta compra já foi concluída anteriormente.' };
    }

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    const buyer = await guild.members.fetch(cart.user_id).catch(() => null);
    if (!buyer) {
        // Se o comprador não estiver no servidor, marcamos como concluído para não processar de novo, mas não entregamos nada.
        await db.query("UPDATE store_carts SET status = 'completed' WHERE channel_id = $1", [cartId]);
        return { success: false, message: 'O comprador não foi encontrado no servidor.' };
    }

    const products = cart.products_json || [];
    const deliveredItems = [];
    const pgClient = await db.getClient();

    try {
        await pgClient.query('BEGIN');

        for (const product of products) {
            const productFromDb = (await pgClient.query('SELECT * FROM store_products WHERE id = $1 FOR UPDATE', [product.id])).rows[0];

            if (productFromDb.stock_type === 'REAL') {
                const stockItemResult = await pgClient.query(`SELECT id, content FROM store_stock WHERE product_id = $1 AND is_claimed = false LIMIT 1 FOR UPDATE`, [product.id]);
                if (stockItemResult.rows.length === 0) {
                    throw new Error(`Estoque real esgotado para o produto: ${product.name}`);
                }
                const stockItem = stockItemResult.rows[0];
                await pgClient.query('UPDATE store_stock SET is_claimed = true, claimed_by_user_id = $1, claimed_at = NOW() WHERE id = $2', [buyer.id, stockItem.id]);
                deliveredItems.push({ name: product.name, content: stockItem.content });
            }
            
            if (productFromDb.stock !== -1) {
                await pgClient.query('UPDATE store_products SET stock = stock - 1 WHERE id = $1', [product.id]);
            }

            if (productFromDb.role_id_to_grant) {
                const role = await guild.roles.fetch(productFromDb.role_id_to_grant).catch(() => null);
                if (role) {
                    await buyer.roles.add(role, 'Compra na loja StoreFlow');
                    if (productFromDb.role_duration_days) {
                        const expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate() + productFromDb.role_duration_days);
                        await pgClient.query(
                            `INSERT INTO store_user_roles_expiration (guild_id, user_id, role_id, expires_at) VALUES ($1, $2, $3, $4)
                             ON CONFLICT (guild_id, user_id, role_id) DO UPDATE SET expires_at = $4`,
                            [guildId, buyer.id, role.id, expiresAt]
                        );
                    }
                }
            }
        }

        if (settings.store_client_role_id) {
            const clientRole = await guild.roles.fetch(settings.store_client_role_id).catch(() => null);
            if (clientRole) {
                await buyer.roles.add(clientRole, 'Cliente verificado pela loja StoreFlow');
            }
        }
        
        await pgClient.query(`UPDATE store_carts SET status = 'completed' WHERE channel_id = $1`, [cartId]);
        
        const finalPrice = cart.total_price || products.reduce((sum, p) => sum + parseFloat(p.price), 0);
        await pgClient.query(
            `INSERT INTO store_sales_log (guild_id, user_id, total_amount, product_details, status) VALUES ($1, $2, $3, $4::jsonb, 'completed')`,
            [cart.guild_id, cart.user_id, finalPrice, JSON.stringify(products)]
        );
        
        await pgClient.query('COMMIT');

        try {
            const dmChannel = await buyer.createDM();
            const deliveryEmbed = new EmbedBuilder().setColor('Green').setTitle('✅ Pagamento Aprovado e Produtos Entregues!');
            let description = `Obrigado por comprar em **${guild.name}**!\n\n`;
            
            if (deliveredItems.length > 0) {
                description += 'Seus produtos estão abaixo:\n\n';
                deliveredItems.forEach(item => {
                    description += `**Produto: ${item.name}**\n||${item.content}||\n\n`;
                });
            } else {
                description += 'Seus produtos (cargos ou itens não-físicos) já foram ativados em sua conta no servidor.\n\n';
            }
            description += `---------------------------------------------------------------------------------\nCarrinho finalizado. Obrigado!`;
            deliveryEmbed.setDescription(description);
            await dmChannel.send({ embeds: [deliveryEmbed] });
        } catch(e) { console.error("Falha ao notificar o usuário da entrega:", e); }
        
        setTimeout(async () => {
            try {
                const anchorChannel = await guild.channels.fetch(cart.channel_id).catch(() => null);
                if (anchorChannel) await anchorChannel.delete('Venda concluída.');
                await db.query('DELETE FROM store_carts WHERE channel_id = $1', [cart.channel_id]);
            } catch (deleteError) { console.error("Falha ao deletar canal do carrinho após aprovação:", deleteError) }
        }, 15000);

        await updateStoreVitrine(client, guildId);
        return { success: true, message: 'Compra aprovada com sucesso.' };

    } catch (error) {
        await pgClient.query('ROLLBACK');
        console.error('[Approve Purchase] Erro ao aprovar compra:', error);
        return { success: false, message: error.message };
    } finally {
        pgClient.release();
    }
}

module.exports = { approvePurchase };