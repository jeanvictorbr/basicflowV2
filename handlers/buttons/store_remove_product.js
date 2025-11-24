// Substitua em: handlers/buttons/store_remove_product.js
const db = require('../../database.js');
const generateRemoveProductSelectMenu = require('../../ui/store/removeProductSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_remove_product',
    async execute(interaction) {
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const ITEMS_PER_PAGE = 25;
        
        const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
        const totalItems = parseInt(countResult.rows[0].count || 0);
        let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (totalPages < 1) totalPages = 1;

        const products = (await db.query(
            'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0', 
            [interaction.guild.id, ITEMS_PER_PAGE]
        )).rows;

        const uiComponents = generateRemoveProductSelectMenu(products, 0, totalPages, false);

        await interaction.editReply({
            components: uiComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};