// Crie este arquivo em: handlers/modals/modal_stop_category_add.js
const db = require('../../database.js');
const generateStopCategoriesMenu = require('../../ui/stopCategoriesMenu.js');

module.exports = {
    customId: 'modal_stop_category_add',
    async execute(interaction) {
        await interaction.deferUpdate();
        const name = interaction.fields.getTextInputValue('input_category_name').trim();
        await db.query('INSERT INTO stop_categories (guild_id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [interaction.guild.id, name]);
        
        const categories = (await db.query('SELECT * FROM stop_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply(generateStopCategoriesMenu(categories));
    }
};