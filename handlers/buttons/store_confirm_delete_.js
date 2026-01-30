// handlers/buttons/store_confirm_delete_.js
const { MessageFlags } = require('discord.js');
const db = require('../../database.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine');
const { logStoreAction } = require('../../utils/loggers/storeLog');

module.exports = {
    customId: 'store_confirm_delprod_', 
    execute: async (interaction) => { // Removi o 'client' dos argumentos para evitar confusão
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Pega o client direto da interação (MUITO MAIS SEGURO)
            const client = interaction.client;
            
            const productId = interaction.customId.split('_')[3];

            if (!productId || isNaN(productId)) {
                return interaction.editReply({ content: '❌ Erro interno: ID do produto inválido.' });
            }

            const check = await db.query('SELECT name, price FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);
            
            if (check.rowCount === 0) {
                return interaction.editReply({ content: '❌ Este produto já foi removido.' });
            }

            const product = check.rows[0];

            // Remove do banco
            await db.query('DELETE FROM store_stock WHERE product_id = $1', [productId]);
            await db.query('DELETE FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);

            // --- LOG DE AUDITORIA CORRIGIDO ---
            // Agora passando 'client' corretamente
            await logStoreAction(client, interaction.guild.id, 'DELETE', interaction.user, {
                name: `Produto: ${product.name}`,
                price: product.price
            });
            // -----------------------------------

            try {
                if (updateStoreVitrine) {
                    await updateStoreVitrine(client, interaction.guild.id, db);
                }
            } catch (vitrineError) {
                console.error('Erro vitrine:', vitrineError);
            }

            await interaction.editReply({ 
                content: `✅ O produto **${product.name}** foi removido com sucesso!` 
            });

            try { if (interaction.message.deletable) await interaction.message.delete(); } catch (e) {}

        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar excluir o produto.' });
        }
    }
};