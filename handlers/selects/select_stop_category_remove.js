// Crie este arquivo em: handlers/selects/select_stop_category_remove.js
const db = require('../../database.js');
const generateStopCategoriesMenu = require('../../ui/stopCategoriesMenu.js');

module.exports = {
    customId: 'select_stop_category_remove',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categoryId = interaction.values[0];
        await db.query('DELETE FROM stop_categories WHERE id = $1 AND guild_id = $2', [categoryId, interaction.guild.id]);

        const categories = (await db.query('SELECT * FROM stop_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply(generateStopCategoriesMenu(categories));
    }
};