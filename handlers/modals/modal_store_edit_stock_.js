// Crie em: handlers/modals/modal_store_edit_stock_.js
const db = require('../../database.js');
const generateStockMenu = require('../../ui/store/stockMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_stock_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.customId.split('_')[4];
        
        const newStockContent = interaction.fields.getTextInputValue('input_stock_content');
        const newItems = newStockContent.split('\n').map(item => item.trim()).filter(item => item.length > 0);

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Apaga APENAS o estoque não vendido do produto
            await client.query('DELETE FROM store_stock WHERE product_id = $1 AND is_claimed = false', [productId]);

            // 2. Insere a nova lista de itens
            for (const item of newItems) {
                await client.query(
                    'INSERT INTO store_stock (guild_id, product_id, content) VALUES ($1, $2, $3)',
                    [interaction.guild.id, productId, item]
                );
            }

            // 3. Atualiza a contagem no produto principal
            await client.query(
                `UPDATE store_products SET stock = $1 WHERE id = $2`,
                [newItems.length, productId]
            );

            await client.query('COMMIT');
            // --- LÓGICA DE NOTIFICAÇÃO ---
            // Só notifica se o novo estoque for maior que 0
            let notifiedCount = 0;
            if (newItems.length > 0) {
                const notifications = await client.query('SELECT user_id FROM store_stock_notifications WHERE product_id = $1', [productId]);
                
                if (notifications.rows.length > 0) {
                    notifiedCount = notifications.rows.length;
                    const productInfo = (await client.query('SELECT name, price FROM store_products WHERE id = $1', [productId])).rows[0];
                    const price = parseFloat(productInfo.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

                    notifications.rows.forEach(async (row) => {
                        try {
                            const user = await interaction.client.users.fetch(row.user_id).catch(() => null);
                            if (user) {
                                await user.send({
                                    content: `🔔 **Novidades na Loja!**\n\nO produto **${productInfo.name}** (${price}) que você estava esperando acabou de ter seu estoque renovado!\nCorra para garantir o seu no servidor **${interaction.guild.name}**.`
                                });
                            }
                        } catch (e) {}
                    });

                    await client.query('DELETE FROM store_stock_notifications WHERE product_id = $1', [productId]);
                }
            }
            // -----------------------------

            const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            
            await interaction.editReply({
                components: generateStockMenu(product, newItems.length),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });

            await interaction.followUp({ content: `✅ Estoque atualizado com sucesso para ${newItems.length} item(ns)!`, ephemeral: true });
            // ATUALIZA A VITRINE DA CATEGORIA ESPECÍFICA
            if (product && product.category_id) {
                await updateStoreVitrine(interaction.client, interaction.guild.id, product.category_id);
            }
            await updateStoreVitrine(interaction.client, interaction.guild.id);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[Store] Erro ao editar estoque real:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao atualizar o estoque.', ephemeral: true });
        } finally {
            client.release();
        }
    }
};