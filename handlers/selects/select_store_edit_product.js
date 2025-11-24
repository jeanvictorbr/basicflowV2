// Substitua em: handlers/selects/select_store_edit_product.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_store_edit_product',
    async execute(interaction) {
        // NÃO use deferUpdate() aqui, pois precisamos abrir o modal
        
        const productId = interaction.values[0];
        if (productId === 'no_result') {
            return interaction.reply({ content: '❌ Nenhuma seleção válida.', ephemeral: true });
        }

        try {
            // 1. Buscar dados atuais
            const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];

            if (!product) {
                return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });
            }

            // 2. Criar o Modal
            const modal = new ModalBuilder()
                .setCustomId(`store_edit_sub_${product.id}`)
                .setTitle(`Editar: ${product.name.substring(0, 30)}`);

            // 3. Campos (Idênticos ao de Adicionar Produto)
            const inputName = new TextInputBuilder()
                .setCustomId('name')
                .setLabel('Nome do Produto')
                .setStyle(TextInputStyle.Short)
                .setValue(product.name)
                .setMaxLength(100)
                .setRequired(true);

            const inputPrice = new TextInputBuilder()
                .setCustomId('price')
                .setLabel('Preço (ex: 10.50)')
                .setStyle(TextInputStyle.Short)
                .setValue(product.price.toString())
                .setRequired(true);

            const inputDesc = new TextInputBuilder()
                .setCustomId('description')
                .setLabel('Descrição')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(product.description || '')
                .setMaxLength(1000)
                .setRequired(false);

            // Campo: Tipo de Estoque (REAL ou GHOST)
            const inputStockType = new TextInputBuilder()
                .setCustomId('stock_type')
                .setLabel('Tipo Estoque (REAL ou GHOST)')
                .setStyle(TextInputStyle.Short)
                .setValue(product.stock_type || 'GHOST')
                .setPlaceholder('Digite REAL para contagem ou GHOST para infinito')
                .setRequired(true);

            // Campo: Duração do Cargo (Dias)
            const inputRoleDuration = new TextInputBuilder()
                .setCustomId('role_duration')
                .setLabel('Duração Cargo (Dias) [0 = Sem Cargo]')
                .setStyle(TextInputStyle.Short)
                .setValue(product.role_duration_days ? product.role_duration_days.toString() : '0')
                .setPlaceholder('Ex: 30 (Deixe 0 para não ter cargo)')
                .setRequired(false);

            // Adicionar campos (Máximo 5)
            modal.addComponents(
                new ActionRowBuilder().addComponents(inputName),
                new ActionRowBuilder().addComponents(inputPrice),
                new ActionRowBuilder().addComponents(inputDesc),
                new ActionRowBuilder().addComponents(inputStockType),
                new ActionRowBuilder().addComponents(inputRoleDuration)
            );

            // 4. Mostrar Modal
            await interaction.showModal(modal);

        } catch (error) {
            console.error("Erro ao abrir modal de edição:", error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao abrir modal.', ephemeral: true });
            }
        }
    }
};