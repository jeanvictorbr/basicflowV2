// File: handlers/commands/meuspedidos.js
const db = require('../../database.js');
const generateCustomerOrdersDashboard = require('../../ui/store/customerOrdersDashboard.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = async function execute(interaction) {
    await interaction.deferReply({ flags: EPHEMERAL_FLAG });

    try {
        // 1. Busca estatísticas gerais
        const statsQuery = await db.query(
            `SELECT COUNT(*) as count, SUM(total_amount) as total 
             FROM store_sales_log 
             WHERE guild_id = $1 AND user_id = $2`,
            [interaction.guild.id, interaction.user.id]
        );
        
        const totalOrders = parseInt(statsQuery.rows[0].count || 0);
        const totalSpent = parseFloat(statsQuery.rows[0].total || 0);

        // 2. Busca os pedidos (ordenados do mais recente)
        const ordersQuery = await db.query(
            `SELECT * FROM store_sales_log 
             WHERE guild_id = $1 AND user_id = $2 
             ORDER BY created_at DESC`,
            [interaction.guild.id, interaction.user.id]
        );

        const orders = ordersQuery.rows;

        // 3. Gera a UI (Página 0)
        const dashboard = generateCustomerOrdersDashboard(interaction, orders, 0, totalOrders, totalSpent);

        // 4. Adiciona as flags V2
        const payload = dashboard[0];
        payload.flags = V2_FLAG | EPHEMERAL_FLAG;

        await interaction.editReply(payload);

    } catch (error) {
        console.error('[MeusPedidos] Erro:', error);
        await interaction.editReply({ content: '❌ Erro ao carregar seu histórico.' });
    }
};