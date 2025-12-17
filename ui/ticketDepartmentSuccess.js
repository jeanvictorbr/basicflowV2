// ui/ticketDepartmentSuccess.js
module.exports = function ticketDepartmentSuccess(deptName, roleIds) {
    const rolesFormatted = roleIds.map(id => `<@&${id}>`).join(', ');

    return {
        // SEM content
        embeds: [
            {
                title: '✅ Departamento Salvo!',
                description: `O departamento **${deptName}** foi criado com sucesso.`,
                color: 0x57F287,
                fields: [
                    { name: 'Cargos Vinculados', value: rolesFormatted || 'Nenhum' }
                ],
                footer: { text: 'BasicFlow' }
            }
        ],
        components: [] // Limpa os botões
    };
};