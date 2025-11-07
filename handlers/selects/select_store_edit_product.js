// Substitua o conteúdo em: handlers/selects/select_store_edit_product.js
const db = require('../../database.js');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'select_store_edit_product',
    async execute(interaction) {
        
        const productId = interaction.values[0];
        
        const productRes = await db.query('SELECT * FROM store_products WHERE id = $1 AND guild_id = $2', [productId, interaction.guild.id]);
        
        if (productRes.rows.length === 0) {
            return interaction.reply({ content: '❌ Este produto não foi encontrado.', flags: EPHEMERAL_FLAG });
        }
        
        const product = productRes.rows[0];

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_edit_product_${productId}`) // O ID do modal é dinâmico
            .setTitle('Editar Produto');

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Produto").setStyle(TextInputStyle.Short).setValue(product.name).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição").setStyle(TextInputStyle.Paragraph).setValue(product.description || '').setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_price').setLabel("Preço (Ex: 19.99)").setStyle(TextInputStyle.Short).setValue(product.price.toString()).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_stock_type').setLabel("Tipo de Estoque ('REAL' ou 'GHOST')").setStyle(TextInputStyle.Short).setValue(product.stock_type).setRequired(true)
            ),
            // --- CAMPO ADICIONADO AQUI ---
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_role_duration')
                    .setLabel("Cargo Temp. (Dias) - Opcional")
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('Ex: 30 (limpe para remover)')
                    .setValue(product.role_duration_days ? product.role_duration_days.toString() : '') // Preenche com o valor atual
                    .setRequired(false)
            )
            // --- FIM DA ADIÇÃO ---
        );
        
        await interaction.showModal(modal);
    }
};