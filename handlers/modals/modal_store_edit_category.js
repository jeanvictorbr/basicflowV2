// Crie em: handlers/modals/modal_store_edit_category.js
const db = require('../../database.js');
const generateCategoriesMenu = require('../../ui/store/categoriesMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_edit_category_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categoryId = interaction.customId.split('_')[4];

        const name = interaction.fields.getTextInputValue('input_name');
        const description = interaction.fields.getTextInputValue('input_desc') || null;

        await db.query(
            'UPDATE store_categories SET name = $1, description = $2 WHERE id = $3 AND guild_id = $4',
            [name, description, categoryId, interaction.guild.id]
        );

        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateCategoriesMenu(categories, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

        // Atualiza a vitrine principal
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};