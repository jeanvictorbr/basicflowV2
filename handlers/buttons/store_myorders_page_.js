// File: handlers/buttons/store_myorders_page_.js
const db = require('../../database.js');
const generateCustomerOrdersDashboard = require('../../ui/store/customerOrdersDashboard.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

module.exports = {
    customId: 'store_myorders_page_',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Extrai a página do ID (store_myorders_page_1)
        const page = parseInt(interaction.customId.split('_').pop());

        // (Repete a lógica de busca para garantir dados frescos)
        const statsQuery = await db.query(
            `SELECT COUNT(*) as count, SUM(total_amount) as total FROM store_sales_log WHERE guild_id = $1 AND user_id = $2`,
            [interaction.guild.id, interaction.user.id]
        );
        const totalOrders = parseInt(statsQuery.rows[0].count || 0);
        const totalSpent = parseFloat(statsQuery.rows[0].total || 0);

        const ordersQuery = await db.query(
            `SELECT * FROM store_sales_log WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
            [interaction.guild.id, interaction.user.id]
        );

        const dashboard = generateCustomerOrdersDashboard(interaction, ordersQuery.rows, page, totalOrders, totalSpent);
        const payload = dashboard[0];
        payload.flags = V2_FLAG | EPHEMERAL_FLAG;

        await interaction.editReply(payload);
    }
};