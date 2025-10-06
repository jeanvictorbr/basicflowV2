// Crie em: ui/ticketsDepartmentsMenu.js
module.exports = function generateDepartmentsMenu(settings, departments) {
    const systemStatus = settings.tickets_use_departments ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.tickets_use_departments 
        ? { label: 'Desativar Departamentos', style: 4, emoji: '✖️' } 
        : { label: 'Ativar Departamentos', style: 3, emoji: '✔️' };

    const departmentList = departments.length > 0
        ? departments.map(d => `> ${d.emoji || '🔹'} **${d.name}** - <@&${d.role_id}>`).join('\n')
        : '> Nenhum departamento criado ainda.';

    return [
        {
            "type": 17, "accent_color": 5752042,
            "components": [
                { "type": 10, "content": "## 🗂️ Gerenciador de Departamentos" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "emoji": { "name": toggleButton.emoji }, "custom_id": "tickets_department_toggle" },
                    "components": [{ "type": 10, "content": `**Sistema de Departamentos**\n> Status: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Departamentos Atuais:" },
                { "type": 10, "content": departmentList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Adicionar", "emoji": { "name": "➕" }, "custom_id": "tickets_department_add" },
                        { "type": 2, "style": 4, "label": "Remover", "emoji": { "name": "🗑️" }, "custom_id": "tickets_department_remove", "disabled": departments.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub Premium", "emoji": { "name": "↩️" }, "custom_id": "tickets_open_premium_menu" }]
                }
            ]
        }
    ];
};