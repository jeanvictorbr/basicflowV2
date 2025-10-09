// Crie este arquivo em: handlers/buttons/stop_manage_categories.js
const db = require('../../database.js');
const generateStopCategoriesMenu = require('../../ui/stopCategoriesMenu.js');

module.exports = {
    customId: 'stop_manage_categories',
    async execute(interaction) {
        await interaction.deferUpdate();
        const categories = (await db.query('SELECT * FROM stop_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        await interaction.editReply(generateStopCategoriesMenu(categories));
    }
};