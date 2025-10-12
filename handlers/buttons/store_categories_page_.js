// Crie em: handlers/buttons/store_categories_page_.js
const db = require('../../database.js');
const generateCategoriesMenu = require('../../ui/store/categoriesMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_categories_page_',
    async execute(interaction) {
        const page = parseInt(interaction.customId.split('_')[3], 10);
        if (isNaN(page)) return;

        await interaction.deferUpdate();
        
        const categories = (await db.query('SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY name ASC', [interaction.guild.id])).rows;
        
        await interaction.editReply({
            components: generateCategoriesMenu(categories, page),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};