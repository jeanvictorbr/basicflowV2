// ui/guardianRulesMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getRuleDescription(rule) {
    let triggerDesc = '';
    switch (rule.trigger_type) {
        case 'TOXICITY':
            triggerDesc = `Se a **toxicidade** for > \`${rule.trigger_threshold}%\``;
            break;
        case 'SPAM_TEXT':
            triggerDesc = `Se repetir a mesma mensagem \`${rule.trigger_threshold}\` vezes`;
            break;
        case 'MENTION_SPAM':
            triggerDesc = `Se mencionar \`${rule.trigger_threshold}\`+ pessoas/cargos`;
            break;
    }

    const actions = [];
    if (rule.action_delete_message) actions.push('Apagar');
    if (rule.action_warn_member_dm) actions.push('Avisar DM');
    
    const punishmentMap = {
        'TIMEOUT': `Silenciar (${rule.action_punishment_duration_minutes || 0}m)`,
        'KICK': 'Expulsar',
        'BAN': 'Banir'
    };
    if (rule.action_punishment !== 'NONE' && punishmentMap[rule.action_punishment]) {
        actions.push(punishmentMap[rule.action_punishment]);
    }

    return `> **Quando:** ${triggerDesc}\n> **Ações:** ${actions.join(' | ') || 'Nenhuma'}`;
}

module.exports = function generateGuardianRulesMenu(rules) {
    const ruleComponents = rules.length > 0
        ? rules.flatMap(rule => [ // flatMap para achatar o array
            { "type": 10, "content": `**${rule.is_enabled ? '🟢' : '🔴'} ${rule.name}**` },
            { "type": 10, "content": getRuleDescription(rule) },
            { "type": 14, "divider": true, "spacing": 1 },
        ])
        : [{ "type": 10, "content": "> Nenhuma regra criada ainda. Clique em \"Adicionar Regra\" para começar." }];

    // Remove a última divisória se existir
    if (ruleComponents.length > 0 && ruleComponents[ruleComponents.length - 1].type === 14) {
        ruleComponents.pop();
    }
        
    const actionButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('guardian_rule_add').setLabel('Adicionar Regra').setStyle(ButtonStyle.Success).setEmoji('➕'),
        new ButtonBuilder().setCustomId('guardian_rule_remove').setLabel('Remover Regra').setStyle(ButtonStyle.Danger).setEmoji('🗑️').setDisabled(rules.length === 0),
        new ButtonBuilder().setCustomId('guardian_rule_toggle').setLabel('Ativar/Desativar').setStyle(ButtonStyle.Secondary).setEmoji('🔄').setDisabled(rules.length === 0)
    );
    
    const backButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('open_guardian_menu').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️')
    );

    return {
        // A resposta agora é um único objeto de componente V2, sem 'embeds'
        components: [
            {
                "type": 17, "accent_color": 15105570,
                "components": [
                    { "type": 10, "content": "## 📜 Gerenciador de Regras do Guardian AI" },
                    { "type": 14, "divider": true, "spacing": 1 },
                    ...ruleComponents, // Adiciona as regras formatadas
                    { "type": 14, "divider": true, "spacing": 2 },
                    { "type": 1, "components": actionButtons.toJSON().components },
                    { "type": 14, "divider": true, "spacing": 1 },
                    { "type": 1, "components": backButton.toJSON().components }
                ]
            }
        ]
    };
};