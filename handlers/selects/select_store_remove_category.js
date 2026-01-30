const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_store_remove_category',
    execute: async (interaction, client) => {
        // Pega o ID da categoria selecionada
        const categoryId = interaction.values[0];

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Busca informações da categoria
            const result = await db.query('SELECT * FROM store_categories WHERE id = $1 AND guild_id = $2', [categoryId, interaction.guild.id]);

            if (result.rowCount === 0) {
                return interaction.editReply({ content: '❌ Essa categoria não existe mais.' });
            }

            const category = result.rows[0];

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Excluir Categoria')
                .setDescription(`Você tem certeza que deseja excluir a categoria **${category.name}**?\n\n⚠️ **Atenção:**\n1. A vitrine desta categoria (se existir) será apagada.\n2. Os produtos desta categoria ficarão "Sem Categoria".`)
                .setColor('#FF0000');

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`store_confirm_delete_cat_${categoryId}`) // Passa o ID no botão
                    .setLabel('Confirmar Exclusão')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️'),
                new ButtonBuilder()
                    .setCustomId('delete_ephemeral_reply')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Secondary)
            );

            await interaction.editReply({ embeds: [embed], components: [row] });

        } catch (error) {
            console.error('Erro ao selecionar categoria:', error);
            await interaction.editReply({ content: '❌ Erro interno ao processar seleção.' });
        }
    }
};