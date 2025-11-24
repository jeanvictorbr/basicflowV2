// Substitua em: handlers/buttons/store_confirm_delete_.js
const db = require('../../database.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const generateRemoveProductSelectMenu = require('../../ui/store/removeProductSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_confirm_delete_',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const productId = interaction.customId.split('_').pop();

        try {
            // 1. Buscar informações do produto ANTES de deletar
            // Precisamos saber o ID do cargo para deletar do Discord
            const productResult = await db.query('SELECT * FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);
            const product = productResult.rows[0];

            if (product) {
                // 2. Verificar e Deletar Cargo do Discord
                // Só deletamos se o bot tiver permissão e se o cargo foi marcado como criado automaticamente
                if (product.role_id_to_grant && product.auto_created_role) {
                    const roleToDelete = await interaction.guild.roles.fetch(product.role_id_to_grant).catch(() => null);
                    
                    if (roleToDelete) {
                        try {
                            await roleToDelete.delete(`StoreFlow: Produto ${product.name} (ID: ${product.id}) foi deletado.`);
                            console.log(`[Store] Cargo ${roleToDelete.name} deletado junto com o produto.`);
                        } catch (roleErr) {
                            console.error(`[Store] Erro ao deletar cargo do produto ${productId}:`, roleErr);
                            // Não impedimos a deleção do produto se o cargo falhar, mas logamos
                        }
                    }
                }

                // 3. Deletar do Banco de Dados
                await db.query('DELETE FROM store_products WHERE id = $1', [productId]);

                // 4. Atualizar Vitrines (Globalmente)
                try {
                    await updateStoreVitrine(interaction.client, interaction.guild.id);
                } catch (err) {
                    console.error("Erro vitrine update delete:", err);
                }
            }

            // 5. Atualizar Menu de Remoção
            const ITEMS_PER_PAGE = 25;
            const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
            let totalPages = Math.ceil(parseInt(countResult.rows[0].count) / ITEMS_PER_PAGE) || 1;

            const products = (await db.query(
                'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0', 
                [interaction.guild.id, ITEMS_PER_PAGE]
            )).rows;

            const uiComponents = generateRemoveProductSelectMenu(products, 0, totalPages, false);

            if (uiComponents[0]?.components?.[0]) {
                uiComponents[0].components[0].content = `> 🗑️ **Produto ${productId} e seus cargos foram removidos!**\n> Selecione outro para remover:`;
            }

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro ao deletar produto:", error);
            await interaction.followUp({ content: '❌ Erro ao processar exclusão.', ephemeral: true });
        }
    }
};