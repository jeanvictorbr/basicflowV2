const db = require('../../database.js');
const getFlowShopUI = require('../../ui/flowCoins/shopUI.js');
const V2_FLAG = 1 << 15;

module.exports = async (interaction) => {
    // Busca itens ativos da loja
    const items = await db.query('SELECT * FROM flow_shop_items WHERE is_active = true ORDER BY price ASC');
    
    // Busca saldo do usuário
    const userRes = await db.query('SELECT balance FROM flow_users WHERE user_id = $1', [interaction.user.id]);
    const balance = userRes.rows[0] ? userRes.rows[0].balance : 0;

    const ui = getFlowShopUI(items.rows, balance);

    await interaction.reply({
        components: ui.components,
        flags: V2_FLAG,
        ephemeral: true
    });
};