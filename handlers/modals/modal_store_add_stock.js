// handlers/modals/modal_store_add_stock.js
const db = require('../../database.js');
const generateStockMenu = require('../../ui/store/stockMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js'); // Garante que a vitrine atualize

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_add_stock_', // Handler dinâmico
    async execute(interaction) {
        // Formato ID: modal_store_add_stock_PRODUTOID
        // Indices: modal(0) store(1) add(2) stock(3) ID(4)
        const productId = interaction.customId.split('_')[4]; 
        
        // Aqui ele busca pelo ID que corrigimos no botão acima
        const stockContent = interaction.fields.getTextInputValue('input_stock_content');
        
        await interaction.deferUpdate();

        const items = stockContent.split('\n').map(item => item.trim()).filter(item => item.length > 0);

        if (items.length === 0) {
            return interaction.followUp({ content: '❌ Nenhum item válido foi fornecido.', ephemeral: true });
        }

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            for (const item of items) {
                await client.query(
                    'INSERT INTO store_stock (guild_id, product_id, content) VALUES ($1, $2, $3)',
                    [interaction.guild.id, productId, item]
                );
            }

            // Atualiza a contagem no produto
            await client.query(
                `UPDATE store_products 
                 SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false) 
                 WHERE id = $1`,
                [productId]
            );

            await client.query('COMMIT');

            // --- Notificações de Estoque (Opcional/Existente) ---
            try {
                const notifications = await client.query('SELECT user_id FROM store_stock_notifications WHERE product_id = $1', [productId]);
                if (notifications.rows.length > 0) {
                    const productInfo = (await client.query('SELECT name, price FROM store_products WHERE id = $1', [productId])).rows[0];
                    const price = parseFloat(productInfo.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    
                    notifications.rows.forEach(async (row) => {
                        try {
                            const user = await interaction.client.users.fetch(row.user_id).catch(() => null);
                            if (user) await user.send({ content: `🔔 **Estoque Renovado!**\nO produto **${productInfo.name}** (${price}) está disponível novamente em **${interaction.guild.name}**!` });
                        } catch (e) {}
                    });
                    await client.query('DELETE FROM store_stock_notifications WHERE product_id = $1', [productId]);
                }
            } catch (notifError) {
                console.error('Erro ao processar notificações de estoque:', notifError);
            }
            // -----------------------------------------------------

            const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            const stockItems = (await db.query('SELECT COUNT(*) as count FROM store_stock WHERE product_id = $1 AND is_claimed = false', [productId])).rows[0];

            await interaction.editReply({
                components: generateStockMenu(product, stockItems.count),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });

            await interaction.followUp({ content: `✅ ${items.length} item(ns) adicionado(s) ao estoque com sucesso!`, ephemeral: true });
            
            // Atualiza Vitrine Global e da Categoria
            try {
                await updateStoreVitrine(interaction.client, interaction.guild.id);
                if (product.category_id) {
                    await updateStoreVitrine(interaction.client, interaction.guild.id, product.category_id);
                }
            } catch (vitrineError) {
                console.error('Erro ao atualizar vitrine após estoque:', vitrineError);
            }

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[Store] Erro ao adicionar estoque real:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao salvar no banco de dados.', ephemeral: true });
        } finally {
            client.release();
        }
    }
};