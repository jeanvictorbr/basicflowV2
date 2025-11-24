// Crie em: handlers/buttons/store_remove_pg_.js
const db = require('../../database.js');
const generateRemoveProductSelectMenu = require('../../ui/store/removeProductSelectMenu.js');

module.exports = {
    customId: 'store_remove_pg_',
    async execute(interaction) {
        try {
            const pageStr = interaction.customId.replace('store_remove_pg_', '');
            let targetPage = parseInt(pageStr);
            if (isNaN(targetPage) || targetPage < 0) targetPage = 0;

            const ITEMS_PER_PAGE = 25;
            const offset = targetPage * ITEMS_PER_PAGE;

            const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
            const totalItems = parseInt(countResult.rows[0].count || 0);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
            if (totalPages < 1) totalPages = 1;

            if (targetPage >= totalPages) targetPage = totalPages - 1;

            const products = (await db.query(
                'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET $3', 
                [interaction.guild.id, ITEMS_PER_PAGE, offset]
            )).rows;

            const uiComponents = generateRemoveProductSelectMenu(products, targetPage, totalPages, false);

            await interaction.update({ components: uiComponents });

        } catch (error) {
            console.error("Erro paginação remove:", error);
            if (!interaction.replied) await interaction.reply({ content: 'Erro ao mudar página.', ephemeral: true });
        }
    }
};