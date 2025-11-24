// Crie em: handlers/modals/modal_store_stock_search.js
const db = require('../../database.js');
const generateManageStockSelectMenu = require('../../ui/store/manageStockSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'modal_store_stock_search',
    async execute(interaction) {
        await interaction.deferUpdate();

        const query = interaction.fields.getTextInputValue('search_query');

        // Busca case-insensitive no banco de dados (ILIKE)
        // Limitamos a 25 pois o select menu não suporta mais que isso em uma única view
        const products = (await db.query(
            'SELECT id, name, price FROM store_products WHERE guild_id = $1 AND name ILIKE $2 ORDER BY id ASC LIMIT 25', 
            [interaction.guild.id, `%${query}%`]
        )).rows;

        // Gera o menu em modo "Busca" (pagina 0, total 1, flag isSearch true)
        const uiComponents = generateManageStockSelectMenu(products, 0, 1, true, query);

        await interaction.editReply({
            components: uiComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};