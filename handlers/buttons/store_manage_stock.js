// Substitua em: handlers/buttons/store_manage_stock.js
const db = require('../../database.js');
const generateManageStockSelectMenu = require('../../ui/store/manageStockSelectMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_manage_stock',
    async execute(interaction) {
        // Interação inicial precisa de deferUpdate
        if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();

        const ITEMS_PER_PAGE = 25;
        
        // 1. Contar
        const countResult = await db.query('SELECT COUNT(*) as count FROM store_products WHERE guild_id = $1', [interaction.guild.id]);
        const totalItems = parseInt(countResult.rows[0].count || 0);
        let totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
        if (totalPages < 1) totalPages = 1;

        // 2. Buscar Página 0
        const products = (await db.query(
            'SELECT id, name, price FROM store_products WHERE guild_id = $1 ORDER BY id ASC LIMIT $2 OFFSET 0', 
            [interaction.guild.id, ITEMS_PER_PAGE]
        )).rows;

        // 3. Gerar UI (Página 0)
        const uiComponents = generateManageStockSelectMenu(products, 0, totalPages, false);

        await interaction.editReply({
            components: uiComponents,
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};