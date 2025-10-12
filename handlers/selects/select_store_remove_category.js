// Crie em: handlers/selects/select_store_remove_category.js
const db = require('../../database.js');
const generateCategoriesMenu = require('../../ui/store/categoriesMenu.js');
const updateStoreVitrine = require('../../utils/updateStoreVitrine.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_store_remove_category',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categoryId = interaction.values[0];
        
        // Desvincula produtos desta categoria antes de removê-la
        await db.query('UPDATE store_products SET category_id = NULL WHERE category_id = $1 AND guild_id = $2', [categoryId, interaction.guild.id]);
        await db.query('DELETE FROM store_categories WHERE id = $1 AND guild_id = $2', [categoryId, interaction.guild.id]);

        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply({
            components: generateCategoriesMenu(categories, 0),
            flags: V2_FLAG | EPHEMERAL_FLAG
        });

        // Atualiza a vitrine principal
        await updateStoreVitrine(interaction.client, interaction.guild.id);
    }
};