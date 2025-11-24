// Crie em: handlers/buttons/store_cats_pg_.js
const db = require('../../database.js');
const generateCategorySelectMenu = require('../../ui/store/categorySelectMenu.js');

module.exports = {
    customId: 'store_cats_pg_',
    async execute(interaction) {
        try {
            // Parse ID: store_cats_pg_edit_2
            const parts = interaction.customId.replace('store_cats_pg_', '').split('_');
            const mode = parts[0]; // 'edit' ou 'remove'
            let targetPage = parseInt(parts[1]);
            if (isNaN(targetPage) || targetPage < 0) targetPage = 0;

            const ITEMS_PER_PAGE = 25;
            const offset = targetPage * ITEMS_PER_PAGE;

            // Query Genérica
            const countRes = await db.query('SELECT COUNT(*) FROM store_categories WHERE guild_id = $1', [interaction.guild.id]);
            const totalItems = parseInt(countRes.rows[0].count);
            let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

            if (targetPage >= totalPages) targetPage = totalPages - 1;

            const categories = (await db.query(
                'SELECT * FROM store_categories WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET $3', 
                [interaction.guild.id, ITEMS_PER_PAGE, offset]
            )).rows;

            const uiComponents = generateCategorySelectMenu(categories, targetPage, totalPages, mode);

            await interaction.update({ components: uiComponents });

        } catch (error) {
            console.error("Erro paginação categorias:", error);
            if (!interaction.replied) await interaction.reply({ content: 'Erro ao mudar página.', ephemeral: true });
        }
    }
};