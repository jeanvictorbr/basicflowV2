// Substitua o conteúdo em: handlers/selects/select_store_remove_product.js
const db = require('../../database.js');
const generateProductsMenu = require('../../ui/store/productsMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_remove_product',
    async execute(interaction) {
        await interaction.deferUpdate();
        const productId = interaction.values[0];

        // --- LÓGICA DE EXCLUSÃO DE CARGO ---
        // Busca o produto ANTES de deletar para ver se tem um cargo auto-criado
        const productResult = await db.query(
            'SELECT role_id_to_grant, auto_created_role FROM store_products WHERE id = $1 AND guild_id = $2', 
            [productId, interaction.guild.id]
        );
        const product = productResult.rows[0];

        if (product && product.auto_created_role && product.role_id_to_grant) {
            try {
                const role = await interaction.guild.roles.fetch(product.role_id_to_grant);
                if (role) {
                    await role.delete('Produto correspondente (StoreFlow) foi excluído.');
                }
            } catch (error) {
                console.error(`[Store] Falha ao deletar cargo automático ${product.role_id_to_grant}:`, error.message);
                await interaction.followUp({ content: '⚠️ O produto foi removido, mas falhei em deletar o cargo automático associado a ele. Delete-o manualmente.', ephemeral: true });
            }
        }
        // --- FIM DA LÓGICA DE EXCLUSÃO ---

        // Deleta o produto (e o estoque/expirações de cargo)
        await db.query('DELETE FROM store_stock WHERE product_id = $1 AND guild_id = $2', [productId, interaction.guild.id]);
        // Limpa também os registros de expiração desse cargo
        if (product && product.role_id_to_grant) {
            await db.query('DELETE FROM store_user_roles_expiration WHERE role_id = $1 AND guild_id = $2', [product.role_id_to_grant, interaction.guild.id]);
        }
        await db.query('DELETE FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);

        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        await interaction.followUp({ content: '✅ Produto e seu estoque/cargos associados foram removidos com sucesso!', ephemeral: true });

        // CHAMA A FUNÇÃO PARA ATUALIZAR A VITRINE
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};