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

        // 1. BUSCA DADOS CRITICOS (Categoria e Cargo) ANTES DE DELETAR
        const productResult = await db.query(
            'SELECT role_id_to_grant, auto_created_role, category_id FROM store_products WHERE id = $1 AND guild_id = $2', 
            [productId, interaction.guild.id]
        );
        const product = productResult.rows[0];

        // Se o produto não existir mais, interrompe
        if (!product) {
             return interaction.followUp({ content: '❌ Produto não encontrado ou já excluído.', ephemeral: true });
        }

        // --- LÓGICA DE EXCLUSÃO DE CARGO ---
        if (product.auto_created_role && product.role_id_to_grant) {
            try {
                const role = await interaction.guild.roles.fetch(product.role_id_to_grant);
                if (role) {
                    await role.delete('Produto correspondente (StoreFlow) foi excluído.');
                }
            } catch (error) {
                console.error(`[Store] Falha ao deletar cargo automático ${product.role_id_to_grant}:`, error.message);
                await interaction.followUp({ content: '⚠️ O produto foi removido, mas falhei em deletar o cargo automático. Delete-o manualmente.', ephemeral: true });
            }
        }
        
        // Limpa registros de expiração do cargo
        if (product.role_id_to_grant) {
            await db.query('DELETE FROM store_user_roles_expiration WHERE role_id = $1 AND guild_id = $2', [product.role_id_to_grant, interaction.guild.id]);
        }
        // --- FIM DA LÓGICA DE EXCLUSÃO ---

        // 2. DELETA O PRODUTO (e estoque via cascade ou manual)
        await db.query('DELETE FROM store_stock WHERE product_id = $1 AND guild_id = $2', [productId, interaction.guild.id]);
        await db.query('DELETE FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);

        // 3. RECARREGA O MENU DE GERENCIAMENTO
        const products = (await db.query('SELECT * FROM store_products WHERE guild_id = $1 ORDER BY id ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateProductsMenu(products, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
        
        await interaction.followUp({ content: '✅ Produto removido e vitrine atualizada!', ephemeral: true });

        // 4. ATUALIZA A VITRINE DA CATEGORIA CORRETA
        // Agora passamos o ID da categoria que salvamos no passo 1
        if (product.category_id) {
            try {
                await updateStoreVitrine(interaction.client, interaction.guild.id, product.category_id);
            } catch (vitrineError) {
                console.error('[Store Remove] Erro ao atualizar vitrine:', vitrineError);
            }
        }
    }
};