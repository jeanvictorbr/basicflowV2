// handlers/buttons/store_confirm_delete_cat_.js
const { MessageFlags } = require('discord.js');
const db = require('../../database.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine'); 
const { logStoreAction } = require('../../utils/loggers/storeLog');

module.exports = {
    customId: 'store_confirm_delete_cat_',
    execute: async (interaction) => {
        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Pega o client da interação (CORREÇÃO)
            const client = interaction.client;

            const parts = interaction.customId.split('_');
            const categoryId = parts[parts.length - 1]; 

            if (!categoryId || isNaN(categoryId)) {
                return interaction.editReply({ content: '❌ Erro: ID da categoria inválido.' });
            }

            const catQuery = await db.query('SELECT * FROM store_categories WHERE id = $1 AND guild_id = $2', [categoryId, interaction.guild.id]);
            
            if (catQuery.rowCount === 0) {
                return interaction.editReply({ content: '❌ Categoria já foi excluída.' });
            }

            const category = catQuery.rows[0];

            // Apaga a vitrine antiga
            if (category.vitrine_channel_id && category.vitrine_message_id) {
                try {
                    const channel = await interaction.guild.channels.fetch(category.vitrine_channel_id).catch(() => null);
                    if (channel) {
                        const msg = await channel.messages.fetch(category.vitrine_message_id).catch(() => null);
                        if (msg) await msg.delete();
                    }
                } catch (msgError) { }
            }

            await db.query('UPDATE store_products SET category_id = NULL WHERE category_id = $1', [categoryId]);
            await db.query('DELETE FROM store_categories WHERE id = $1', [categoryId]);

            // --- LOG DE AUDITORIA CORRIGIDO ---
            await logStoreAction(client, interaction.guild.id, 'DELETE', interaction.user, {
                name: `Categoria: ${category.name}`
            });
            // -----------------------------------

            try {
                if (updateStoreVitrine) {
                    await updateStoreVitrine(client, interaction.guild.id, db);
                }
            } catch (vitrineError) {
                console.error('[Store] Erro ao atualizar vitrine principal:', vitrineError);
            }

            await interaction.editReply({ 
                content: `✅ A categoria **${category.name}** foi excluída e sua vitrine removida com sucesso!` 
            });

        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar excluir a categoria.' });
        }
    }
};