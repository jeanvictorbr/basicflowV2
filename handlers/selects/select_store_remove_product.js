// handlers/selects/select_store_remove_product.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_store_remove_product',
    execute: async (interaction, client) => {
        const productId = interaction.values[0];

        try {
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            // Busca produto
            const result = await db.query('SELECT name, price FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);
            
            if (result.rowCount === 0) {
                return interaction.editReply({ content: '❌ Produto não encontrado ou já excluído.' });
            }

            const product = result.rows[0];

            const embed = new EmbedBuilder()
                .setTitle('🗑️ Confirmar Exclusão de Produto')
                .setDescription(`Você tem certeza que deseja remover este produto?\n\n📦 **${product.name}**\n💰 R$ ${product.price}`)
                .setColor('#FF0000');

            const row = new ActionRowBuilder().addComponents(
                // MUDANÇA AQUI: ID ÚNICO PARA PRODUTOS "store_confirm_delprod_"
                new ButtonBuilder()
                    .setCustomId(`store_confirm_delprod_${productId}`) 
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
            console.error('Erro ao selecionar produto:', error);
            if (!interaction.replied) await interaction.reply({ content: '❌ Erro ao processar.', flags: MessageFlags.Ephemeral });
        }
    }
};