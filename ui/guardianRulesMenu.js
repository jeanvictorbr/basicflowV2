// Crie em: ui/guardianRulesMenu.js
const { EmbedBuilder } = require('discord.js');

function getRuleDescription(rule) {
    let description = `> **Gatilho:** `;
    switch (rule.trigger_type) {
        case 'TOXICITY':
            description += `Toxicidade acima de \`${rule.trigger_threshold}%\``;
            break;
        case 'SPAM_TEXT':
            description += `Repetir a mesma mensagem \`${rule.trigger_threshold}\` vezes em 1 minuto`;
            break;
        case 'MENTION_SPAM':
            description += `Mencionar \`${rule.trigger_threshold}\` ou mais usuários/cargos em uma mensagem`;
            break;
    }

    description += `\n> **Ações:** `;
    const actions = [];
    if (rule.action_delete_message) actions.push('Apagar Mensagem');
    if (rule.action_warn_member_dm) actions.push('Avisar por DM');
    if (rule.action_punishment !== 'NONE') {
        const punishment_map = {
            'TIMEOUT_5_MIN': 'Silenciar por 5 min',
            'TIMEOUT_30_MIN': 'Silenciar por 30 min',
            'KICK': 'Expulsar Membro'
        };
        actions.push(punishment_map[rule.action_punishment] || 'Nenhuma');
    }

    description += actions.join(', ') || 'Nenhuma';
    return description;
}

module.exports = function generateGuardianRulesMenu(rules) {
    const rulesList = rules.length > 0
        ? rules.map(rule => `**${rule.is_enabled ? '🟢' : '🔴'} ${rule.name}**\n${getRuleDescription(rule)}`).join('\n\n')
        : '> Nenhuma regra criada ainda. Clique em "Adicionar Regra" para começar.';

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 📜 Gerenciador de Regras do Guardian AI" },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": rulesList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Regra", "emoji": { "name": "➕" }, "custom_id": "guardian_rule_add" },
                        { "type": 2, "style": 4, "label": "Remover Regra", "emoji": { "name": "🗑️" }, "custom_id": "guardian_rule_remove", "disabled": rules.length === 0 },
                        { "type": 2, "style": 2, "label": "Ativar/Desativar", "emoji": { "name": "🔄" }, "custom_id": "guardian_rule_toggle", "disabled": rules.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_guardian_menu" }]
                }
            ]
        }
    ];
};