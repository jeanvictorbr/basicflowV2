// Crie em: handlers/selects/select_store_edit_category.js
const { ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_store_edit_category',
    async execute(interaction) {
        const categoryId = interaction.values[0];
        const category = (await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId])).rows[0];

        if (!category) {
            return interaction.reply({ content: 'Categoria não encontrada.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`modal_store_edit_category_${categoryId}`)
            .setTitle(`Editando: ${category.name}`);

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_name').setLabel("Nome da Categoria").setStyle(TextInputStyle.Short).setValue(category.name).setRequired(true)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId('input_desc').setLabel("Descrição (opcional)").setStyle(TextInputStyle.Paragraph).setValue(category.description || '').setRequired(false)
            )
        );
        await interaction.showModal(modal);
    }
};