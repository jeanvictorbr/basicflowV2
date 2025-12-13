// handlers/modals/modal_ticket_department_add.js
const generateRoleMenu = require('../../ui/ticketRoleSelectMenu.js');

module.exports = {
    customId: 'modal_ticket_department_add',
    async execute(interaction) {
        const name = interaction.fields.getTextInputValue('input_dept_name');
        const description = interaction.fields.getTextInputValue('input_dept_desc');
        const emoji = interaction.fields.getTextInputValue('input_dept_emoji') || '';

        // Carrega e filtra cargos (sem @everyone e bots gerenciados)
        const allRoles = interaction.guild.roles.cache
            .filter(r => r.id !== interaction.guild.id && !r.managed) 
            .sort((a, b) => b.position - a.position)
            .map(r => ({ name: r.name, id: r.id }));

        // Salva cache
        const tempId = interaction.user.id;
        interaction.client.tempDeptData = interaction.client.tempDeptData || new Map();
        
        interaction.client.tempDeptData.set(tempId, { 
            name, 
            description, 
            emoji,
            availableRoles: allRoles,
            selectedIds: [], // Começa vazio
            currentPage: 0
        });

        // Gera UI Pagina 0
        const payload = generateRoleMenu(name, allRoles, [], 0);

        await interaction.reply(payload);
    }
};