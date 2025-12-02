// handlers/buttons/store_remove_product.js
const { PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
// Importe seu gerador de menu de seleção se necessário, ou lógica de deleção direta

module.exports = {
    customId: 'store_remove_product',
    async execute(interaction) {
        // 1. Verificação Estrita: APENAS ADMIN
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ 
                content: '⛔ **Acesso Negado:** Apenas Administradores podem deletar produtos.', 
                ephemeral: true 
            });
        }

        // Lógica original de remoção (mantendo o padrão de mostrar menu de seleção ou deletar)
        // Como não tenho o código original exato deste arquivo aqui, vou prover a estrutura segura
        // que busca os produtos para deletar (padrão do bot)
        
        try {
            const products = (await db.query('SELECT id, name FROM store_products WHERE guild_id = $1', [interaction.guild.id])).rows;

            if (products.length === 0) {
                return interaction.reply({ content: '❌ Nenhum produto para remover.', ephemeral: true });
            }

            const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

            const select = new StringSelectMenuBuilder()
                .setCustomId('select_store_remove_product')
                .setPlaceholder('Selecione o produto para DELETAR PERMANENTEMENTE')
                .addOptions(products.map(p => ({
                    label: p.name,
                    description: `ID: ${p.id}`,
                    value: p.id.toString(),
                    emoji: '🗑️'
                })));

            const row = new ActionRowBuilder().addComponents(select);

            await interaction.reply({
                content: '⚠️ **Zona de Perigo:** Selecione o produto que deseja remover.',
                components: [row],
                ephemeral: true
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Erro ao carregar menu de remoção.', ephemeral: true });
        }
    }
};