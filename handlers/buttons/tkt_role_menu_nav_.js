// handlers/buttons/tkt_role_menu_nav_.js
const generateRoleMenu = require('../../ui/ticketRoleSelectMenu.js');

module.exports = {
    customId: 'tkt_role_menu_nav_', // Dinâmico
    async execute(interaction) {
        const data = interaction.client.tempDeptData?.get(interaction.user.id);
        if (!data) return interaction.update({ content: '❌ Expirado.', components: [] });

        const action = interaction.customId.split('_')[4]; // prev ou next
        
        if (action === 'next') data.currentPage++;
        if (action === 'prev') data.currentPage--;

        interaction.client.tempDeptData.set(interaction.user.id, data);

        const payload = generateRoleMenu(data.name, data.availableRoles, data.selectedIds, data.currentPage);
        await interaction.update(payload);
    }
};