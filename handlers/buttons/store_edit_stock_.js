// Substitua em: handlers/buttons/store_edit_stock_.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'store_edit_stock_',
    async execute(interaction) {
        // Extrair o ID do item de estoque (ex: store_edit_stock_230 -> 230)
        const stockId = interaction.customId.split('_').pop();

        try {
            // 1. Buscar o conteúdo atual do estoque
            const result = await db.query('SELECT content FROM store_stock WHERE id = $1', [stockId]);
            
            if (result.rows.length === 0) {
                return interaction.reply({ content: '❌ Item de estoque não encontrado.', ephemeral: true });
            }

            const currentContent = result.rows[0].content || '';

            // 2. Criar o Modal
            const modal = new ModalBuilder()
                .setCustomId(`modal_store_edit_stock_${stockId}`)
                .setTitle(`Editar Estoque #${stockId}`);

            // 3. Preparar o conteúdo seguro (CORREÇÃO DO ERRO)
            // O Discord aceita no máximo 4000 caracteres. Se for maior, cortamos.
            let safeContent = currentContent;
            if (safeContent.length > 4000) {
                safeContent = safeContent.slice(0, 4000);
                console.log(`[Aviso] Conteúdo do estoque ${stockId} truncado para caber no modal.`);
            }

            const inputContent = new TextInputBuilder()
                .setCustomId('content')
                .setLabel('Conteúdo (Chave/Link/Texto)')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(safeContent) // <--- AQUI ESTAVA O ERRO (Agora está protegido)
                .setRequired(true);

            // Se o texto foi cortado, avisamos no placeholder ou label (opcional, mas bom para UX)
            if (currentContent.length > 4000) {
                inputContent.setLabel('Conteúdo (TRUNCADO - Original muito grande)');
            }

            const row = new ActionRowBuilder().addComponents(inputContent);
            modal.addComponents(row);

            // 4. Mostrar o Modal
            await interaction.showModal(modal);

        } catch (error) {
            console.error("Erro ao abrir edição de estoque:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao abrir editor. O conteúdo pode ser muito grande.', ephemeral: true });
            }
        }
    }
};