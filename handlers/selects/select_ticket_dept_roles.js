// handlers/selects/select_ticket_dept_roles.js
const generateRoleMenu = require('../../ui/ticketRoleSelectMenu.js');

module.exports = {
    customId: 'select_ticket_dept_roles',
    async execute(interaction) {
        const tempId = interaction.user.id;
        const data = interaction.client.tempDeptData?.get(tempId);

        if (!data) {
            return interaction.update({ content: '❌ Sessão expirada.', components: [], embeds: [] });
        }

        // 1. Identificar quais cargos estavam disponíveis NESTA página
        // Isso é necessário para saber se o usuário DESMARCOU algo.
        const ROLES_PER_PAGE = 25;
        const start = data.currentPage * ROLES_PER_PAGE;
        const pageRoles = data.availableRoles.slice(start, start + ROLES_PER_PAGE);
        
        // IDs que acabaram de ser enviados pelo usuário no menu
        const submittedIds = interaction.values; 

        // 2. Atualizar a lista global (selectedIds)
        pageRoles.forEach(role => {
            const wasSelected = data.selectedIds.includes(role.id);
            const isNowSelected = submittedIds.includes(role.id);

            if (isNowSelected && !wasSelected) {
                // Adicionar
                data.selectedIds.push(role.id);
            } else if (!isNowSelected && wasSelected) {
                // Remover
                data.selectedIds = data.selectedIds.filter(id => id !== role.id);
            }
        });

        // 3. Salvar e Atualizar UI
        interaction.client.tempDeptData.set(tempId, data);

        const payload = generateRoleMenu(data.name, data.availableRoles, data.selectedIds, data.currentPage);
        
        await interaction.update(payload);
    }
};