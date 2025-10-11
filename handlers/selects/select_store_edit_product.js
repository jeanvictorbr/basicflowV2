// Crie em: handlers/selects/select_store_edit_product.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_store_edit_product',
    async execute(interaction) {
        const productId = interaction.values[0];
        const product = (await db.query('SELECT * FROM store_products WHERE id = $1', [productId])).rows[0];

        if (!product) {
            return interaction.reply({ content: 'Produto não encontrado.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_edit_product_${productId}`)
            .setTitle(`Editando: ${product.name}`);

        modal.addComponents(
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_name').setLabel("Nome do Produto").setStyle(TextInputStyle.Short).setValue(product.name).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_price').setLabel("Preço").setStyle(TextInputStyle.Short).setValue(String(product.price)).setRequired(true)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição").setStyle(TextInputStyle.Paragraph).setValue(product.description || '').setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_role_id').setLabel("ID do Cargo a ser Entregue").setStyle(TextInputStyle.Short).setValue(product.role_id_to_grant || '').setRequired(false)),
            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('input_stock').setLabel("Estoque (-1 para infinito)").setStyle(TextInputStyle.Short).setValue(String(product.stock)).setRequired(true))
        );

        await interaction.showModal(modal);
    }
};