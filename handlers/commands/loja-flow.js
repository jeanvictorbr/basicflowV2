// handlers/commands/loja-flow.js
const db = require('../../database.js');
const generateShopUI = require('../../ui/flowCoins/shopUI.js');

module.exports = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });

    try {
        const userId = interaction.user.id;

        // No início da função execute(interaction) {
if (!interaction.member.permissions.has('Administrator')) {
    return interaction.reply({ content: '❌ Este comando é exclusivo para Administradores do servidor.', ephemeral: true });
}

        // 1. Busca saldo do usuário (Cria se não existir)
        let user = (await db.query('SELECT balance FROM flow_users WHERE user_id = $1', [userId])).rows[0];
        if (!user) {
            await db.query('INSERT INTO flow_users (user_id) VALUES ($1)', [userId]);
            user = { balance: 0 };
        }
        const balance = parseInt(user.balance || 0);

        // 2. Busca itens da loja
        // [CORREÇÃO] O erro estava aqui. Faltava o .rows no final
        const itemsResult = await db.query('SELECT * FROM flow_shop_items WHERE is_active = true ORDER BY price ASC');
        const shopItems = itemsResult.rows || []; // Garante que seja um array

        // 3. Gera a UI
        const payload = generateShopUI(balance, shopItems);

        await interaction.editReply(payload);

    } catch (error) {
        console.error('Erro no comando /loja-flow:', error);
        await interaction.editReply({ content: '❌ Ocorreu um erro ao carregar a loja.' });
    }
};