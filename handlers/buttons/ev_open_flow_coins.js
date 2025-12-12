const db = require('../../database.js');
const getMenu = require('../../ui/devPanel/devFlowCoinsMenu.js');
const V2_FLAG = 1 << 15;

module.exports = {
    customId: 'dev_open_flow_coins',
    async execute(interaction) {
        // Busca estatísticas
        const coinsRes = await db.query('SELECT SUM(balance) as total FROM flow_users');
        const itemsRes = await db.query('SELECT COUNT(*) as count FROM flow_shop_items');

        const totalCoins = coinsRes.rows[0].total || 0;
        const totalItems = itemsRes.rows[0].count || 0;

        const ui = getMenu(totalCoins, totalItems);
        
        await interaction.update({ components: ui.components, flags: V2_FLAG });
    }
};