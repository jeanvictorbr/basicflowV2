// ui/guardianPolicyStepsMenu.js
module.exports = function generatePolicyStepsMenu(policy, steps) {
    const stepComponents = steps.length > 0
        ? steps.sort((a, b) => a.step_level - b.step_level).flatMap(step => {
            const actions = [];
            if (step.action_delete_message) actions.push('Apagar Msg');
            if (step.action_warn_publicly) actions.push('Avisar no Chat');
            const punishmentMap = { 'TIMEOUT': `Silenciar (${step.action_punishment_duration_minutes}m)`, 'KICK': 'Expulsar', 'BAN': 'Banir' };
            if (step.action_punishment !== 'NONE') actions.push(punishmentMap[step.action_punishment]);

            return [
                { type: 10, content: `**Nível ${step.step_level}:** Limiar de \`${step.threshold}\`` },
                { type: 10, content: `> **Ações:** ${actions.join(' | ') || 'Nenhuma'}` },
                { type: 14, divider: true, spacing: 1 }
            ];
        })
        : [{ type: 10, content: '> Nenhum passo definido. Clique em "Adicionar Passo" para começar.' }];
    
    if (stepComponents.length > 1) stepComponents.pop();

    return [
        {
            type: 17, accent_color: 3447003,
            components: [
                { type: 10, content: `## 🪜 Passos da Política: ${policy.name}` },
                { type: 10, content: `> Sequência de ações para o gatilho \`${policy.trigger_type}\`.` },
                { type: 14, divider: true, spacing: 1 },
                ...stepComponents,
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1, components: [
                        { type: 2, style: 3, label: "Adicionar Passo", emoji: { name: "➕" }, custom_id: `guardian_step_add_${policy.id}` },
                        { type: 2, style: 4, label: "Remover Último Passo", emoji: { name: "🗑️" }, custom_id: `guardian_step_remove_${policy.id}`, disabled: steps.length === 0 }
                    ]
                },
                { type: 14, divider: true, spacing: 1 },
                { type: 1, components: [{ type: 2, style: 2, label: "Voltar para Políticas", emoji: { name: "↩️" }, custom_id: "guardian_open_rules_menu" }] }
            ]
        }
    ];
};