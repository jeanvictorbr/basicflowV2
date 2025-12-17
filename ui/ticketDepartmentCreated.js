// ui/ticketDepartmentCreated.js
module.exports = function ticketDepartmentCreated(deptName, roleIds) {
    // Formata a lista de menções aos cargos
    // roleIds é um array, ex: ['123456789', '987654321']
    const rolesFormatted = roleIds.map(id => `<@&${id}>`).join(', ');

    return {
        // NÃO enviamos 'content' aqui para evitar o erro V2
        embeds: [
            {
                title: '✅ Departamento Salvo!',
                description: `O departamento **${deptName}** foi criado com sucesso.`,
                fields: [
                    {
                        name: '🎭 Cargos Responsáveis',
                        value: rolesFormatted || 'Nenhum selecionado'
                    }
                ],
                color: 0x57F287, // Green
                footer: {
                    text: 'Koda Ticket System'
                }
            }
        ],
        components: [] // Array vazio remove o menu de seleção da tela
    };
};