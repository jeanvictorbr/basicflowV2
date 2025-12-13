// handlers/buttons/tkt_role_nav_.js
const generateRoleSelector = require('../../ui/ticketRoleSelector.js');

module.exports = {
    customId: 'tkt_role_nav_',
    async execute(interaction) {
        const tempId = interaction.user.id;
        const data = interaction.client.tempDeptData?.get(tempId);

        if (!data) return interaction.update({ content: '❌ Sessão expirada.', components: [] });

        const parts = interaction.customId.split('_');
        const action = parts[3]; // 'prev' ou 'next'
        const currentPage = parseInt(parts[4]);

        let newPage = currentPage;
        if (action === 'next') newPage++;
        if (action === 'prev') newPage--;

        data.currentPage = newPage;
        interaction.client.tempDeptData.set(tempId, data);

        const payload = generateRoleSelector(data.name, data.availableRoles, data.selectedIds, newPage);
        await interaction.update(payload);
    }
};