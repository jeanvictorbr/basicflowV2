// Crie em: handlers/modals/modal_store_add_stock.js
const db = require('../../database.js');
const generateStockMenu = require('../../ui/store/stockMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js'); // IMPORTA A FUNÇÃO
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_add_stock_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.customId.split('_')[4];
        
        const stockContent = interaction.fields.getTextInputValue('input_stock_content');
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

            await client.query(
                `UPDATE store_products 
                 SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false) 
                 WHERE id = $1`,
                [productId]
            );

            await client.query('COMMIT');

            const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            const stockItems = (await db.query('SELECT COUNT(*) as count FROM store_stock WHERE product_id = $1 AND is_claimed = false', [productId])).rows[0];

            await interaction.editReply({
                components: generateStockMenu(product, stockItems.count),
                flags: V2_FLAG | EPHEMERAL_FLAG,
            });

            await interaction.followUp({ content: `✅ ${items.length} item(ns) adicionado(s) ao estoque com sucesso!`, ephemeral: true });
            
            // CHAMA A FUNÇÃO PARA ATUALIZAR A VITRINE
            await updateStoreVitrine(interaction.client, interaction.guild.id);

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('[Store] Erro ao adicionar estoque real:', error);
            await interaction.followUp({ content: '❌ Ocorreu um erro ao adicionar os itens ao estoque.', ephemeral: true });
        } finally {
            client.release();
        }
    }
};