// Crie em: handlers/selects/select_store_remove_category.js
const db = require('../../database.js');
const generateCategoryRemovePanel = require('../../ui/store/categoryRemovePanel.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_remove_category',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const categoryId = interaction.values[0];
        if (categoryId === 'no_result') return;

        try {
            const category = (await db.query('SELECT * FROM store_categories WHERE id = $1', [categoryId])).rows[0];
            if (!category) return interaction.editReply({ content: '❌ Categoria não encontrada.', components: [] });

            const uiComponents = generateCategoryRemovePanel(category);

            await interaction.editReply({
                components: uiComponents,
                flags: V2_FLAG | EPHEMERAL_FLAG
            });
        } catch (error) {
            console.error("Erro select remove cat:", error);
        }
    }
};