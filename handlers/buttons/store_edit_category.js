// Substitua em: handlers/buttons/store_edit_category.js
const db = require('../../database.js');
const generateCategorySelectMenu = require('../../ui/store/categorySelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_edit_category',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const ITEMS_PER_PAGE = 25;
        
        const countRes = await db.query('SELECT COUNT(*) FROM store_categories WHERE guild_id = $1', [interaction.guild.id]);
        const totalPages = Math.ceil(parseInt(countRes.rows[0].count) / ITEMS_PER_PAGE) || 1;

        const categories = (await db.query(
            'SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0', 
            [interaction.guild.id, ITEMS_PER_PAGE]
        )).rows;

        const uiComponents = generateCategorySelectMenu(categories, 0, totalPages, 'edit');

        await interaction.editReply({
            components: uiComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};