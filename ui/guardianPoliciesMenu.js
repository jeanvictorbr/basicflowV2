// ui/guardianPoliciesMenu.js
module.exports = function generateGuardianPoliciesMenu(policies) {
    const policyComponents = policies.length > 0
        ? policies.flatMap(policy => ([
            {
                type: 9,
                accessory: { type: 2, style: 1, label: "Gerenciar Passos", custom_id: `guardian_manage_steps_${policy.id}`, emoji: { name: "🪜" } },
                components: [
                    { type: 10, content: `**${policy.is_enabled ? '🟢' : '🔴'} ${policy.name}**` },
                    { type: 10, content: `> **Gatilho:** \`${policy.trigger_type}\` | **Reset:** \`${policy.reset_interval_hours}h\`` }
                ]
            },
            { type: 14, divider: true, spacing: 1 }
        ]))
        : [{ type: 10, content: '> Nenhuma política criada. Clique em "Adicionar Política" para começar.' }];

    if (policyComponents.length > 1) policyComponents.pop(); // Remove a última divisória

    return [
        {
            type: 17, accent_color: 15105570,
            components: [
                { type: 10, content: "## 📜 Gerenciador de Políticas do Guardian AI" },
                { type: 10, content: "> Uma 'Política' é um conjunto de regras de escalonamento para um tipo de infração." },
                { type: 14, divider: true, spacing: 1 },
                ...policyComponents,
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1, components: [
                        { type: 2, style: 3, label: "Adicionar", emoji: { name: "➕" }, custom_id: "guardian_policy_add" },
                        { type: 2, style: 4, label: "Remover", emoji: { name: "🗑️" }, custom_id: "guardian_policy_remove", disabled: policies.length === 0 },
                        { type: 2, style: 2, label: "Ativar/Desativar", emoji: { name: "🔄" }, custom_id: "guardian_policy_toggle", disabled: policies.length === 0 }
                    ]
                },
                { type: 14, divider: true, spacing: 1 },
                { type: 1, components: [{ type: 2, style: 2, label: "Voltar", emoji: { name: "↩️" }, custom_id: "open_guardian_menu" }] }
            ]
        }
    ];
};