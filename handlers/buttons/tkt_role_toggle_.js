// handlers/buttons/tkt_role_toggle_.js
const generateRoleSelector = require('../../ui/ticketRoleSelector.js');

module.exports = {
    customId: 'tkt_role_toggle_', // Roteamento dinâmico
    async execute(interaction) {
        const tempId = interaction.user.id;
        const data = interaction.client.tempDeptData?.get(tempId);

        if (!data) {
            return interaction.update({ content: '❌ Sessão expirada. Comece novamente.', components: [], embeds: [] });
        }

        // Pega o ID do cargo do customId do botão
        const roleId = interaction.customId.replace('tkt_role_toggle_', '');

        // Adiciona ou remove da lista
        if (data.selectedIds.includes(roleId)) {
            data.selectedIds = data.selectedIds.filter(id => id !== roleId);
        } else {
            data.selectedIds.push(roleId);
        }

        // Atualiza cache
        interaction.client.tempDeptData.set(tempId, data);

        // Regenera a tela
        const payload = generateRoleSelector(data.name, data.availableRoles, data.selectedIds, data.currentPage);
        await interaction.update(payload);
    }
};