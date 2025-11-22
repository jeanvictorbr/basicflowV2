// Arquivo: handlers/buttons/store_manage_cat_visuals_.js
const db = require('../../database');
const categoryConfigMenu = require('../../ui/store/categoryConfigMenu');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants');

module.exports = {
    customId: 'store_manage_cat_visuals_', // ID Dinâmico
    execute: async (interaction) => {
        const categoryId = interaction.customId.split('_').pop();

        const result = await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId]);
        
        if (result.rows.length === 0) {
            return interaction.reply({ content: '❌ Categoria não encontrada.', flags: EPHEMERAL_FLAG });
        }

        const categoryData = result.rows[0];
        const menuComponents = categoryConfigMenu(categoryData);

        try {
            await interaction.update({
                components: menuComponents,
                flags: V2_FLAG
            });
        } catch (error) {
            console.error("[Store Visuals] Erro ao atualizar menu:", error);
            
            // Se o update falhou, a interação ainda está pendente. Usamos reply.
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ 
                    content: '❌ Erro técnico ao carregar o visual (API 50035). Verifique o log.', 
                    flags: EPHEMERAL_FLAG 
                });
            }
        }
    }
};