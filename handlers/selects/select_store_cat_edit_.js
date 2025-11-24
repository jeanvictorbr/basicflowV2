// Crie em: handlers/selects/select_store_cat_edit_.js
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    // Captura IDs como 'select_store_cat_edit_5'
    customId: 'select_store_cat_edit_',
    async execute(interaction) {
        // Extrair Category ID do nome do handler
        const categoryId = interaction.customId.replace('select_store_cat_edit_', '');
        const productId = interaction.values[0];

        if (productId === 'no_result') return interaction.reply({ content: '❌ Seleção inválida.', ephemeral: true });

        try {
            const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];
            if (!product) return interaction.reply({ content: '❌ Produto não encontrado.', ephemeral: true });

            // --- AQUI ESTÁ O SEGREDO ---
            // Criamos o Modal com um sufixo especial '_cat_ID'
            // Assim, quando o modal for enviado, saberemos para onde voltar!
            const modal = new ModalBuilder()
                .setCustomId(`store_edit_sub_${product.id}_cat_${categoryId}`)
                .setTitle(`Editar: ${product.name.substring(0, 30)}`);

            // (Mesmos campos do modal padrão)
            const inputName = new TextInputBuilder().setCustomId('name').setLabel('Nome').setStyle(TextInputStyle.Short).setValue(product.name).setRequired(true);
            const inputPrice = new TextInputBuilder().setCustomId('price').setLabel('Preço').setStyle(TextInputStyle.Short).setValue(product.price.toString()).setRequired(true);
            const inputDesc = new TextInputBuilder().setCustomId('description').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setValue(product.description || '').setRequired(false);
            const inputStockType = new TextInputBuilder().setCustomId('stock_type').setLabel('Tipo (REAL/GHOST)').setStyle(TextInputStyle.Short).setValue(product.stock_type || 'GHOST').setRequired(true);
            const inputRoleDuration = new TextInputBuilder().setCustomId('role_duration').setLabel('Dias do Cargo (0 = Sem)').setStyle(TextInputStyle.Short).setValue(product.role_duration_days ? product.role_duration_days.toString() : '0').setRequired(false);

            modal.addComponents(
                new ActionRowBuilder().addComponents(inputName),
                new ActionRowBuilder().addComponents(inputPrice),
                new ActionRowBuilder().addComponents(inputDesc),
                new ActionRowBuilder().addComponents(inputStockType),
                new ActionRowBuilder().addComponents(inputRoleDuration)
            );

            await interaction.showModal(modal);

        } catch (error) {
            console.error("Erro ao abrir modal edit cat:", error);
        }
    }
};