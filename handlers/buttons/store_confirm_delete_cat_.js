// Crie em: handlers/buttons/store_confirm_delete_cat_.js
const db = require('../../database.js');
const generateCategoriesMenu = require('../../ui/store/categoriesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_confirm_delete_cat_',
    async execute(interaction) {
        // Deferir atualização
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        // Extrair ID: store_confirm_delete_cat_123
        const categoryId = interaction.customId.split('_').pop();

        try {
            // 1. Buscar dados antes de deletar (para limpar a vitrine)
            const catResult = await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId]);
            
            if (catResult.rows.length > 0) {
                const category = catResult.rows[0];

                // 2. Apagar Mensagem da Vitrine (Se configurada)
                if (category.vitrine_channel_id && category.vitrine_message_id) {
                    try {
                        const channel = await interaction.guild.channels.fetch(category.vitrine_channel_id).catch(() => null);
                        if (channel) {
                            const msg = await channel.messages.fetch(category.vitrine_message_id).catch(() => null);
                            if (msg) await msg.delete();
                        }
                    } catch (err) {
                        console.error(`[Store] Erro ao limpar vitrine da categoria ${categoryId}:`, err);
                    }
                }

                // 3. Desvincular Produtos (Segurança)
                // Define category_id como NULL para produtos que estavam nesta categoria
                await db.query('UPDATE store_products SET category_id = NULL WHERE category_id = $1', [categoryId]);

                // 4. DELETAR A CATEGORIA (Ação Principal)
                await db.query('DELETE FROM store_categories WHERE id = $1', [categoryId]);
            }

            // 5. Recarregar o Menu de Gerenciamento de Categorias
            const categories = (await db.query(
                'SELECT id, name FROM store_categories WHERE guild_id = $1 ORDER BY id ASC', 
                [interaction.guild.id]
            )).rows;

            const uiComponents = generateCategoriesMenu(categories);

            // Adiciona mensagem de sucesso no topo
            if (uiComponents[0] && uiComponents[0].components && uiComponents[0].components[0]) {
                uiComponents[0].components[0].content = `> ✅ **Sucesso:** Categoria deletada e vitrine limpa!\n` + uiComponents[0].components[0].content;
            }

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });

        } catch (error) {
            console.error("Erro ao deletar categoria:", error);
            await interaction.followUp({ content: '❌ Erro ao processar exclusão.', ephemeral: true });
        }
    }
};