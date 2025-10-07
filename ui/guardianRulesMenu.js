// ui/guardianRulesMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function getRuleInfo(rule) {
    let triggerDesc = 'Não definido';
    if (rule.trigger_type && rule.trigger_threshold) {
        switch (rule.trigger_type) {
            case 'TOXICITY':
                triggerDesc = `Toxicidade > \`${rule.trigger_threshold}%\``;
                break;
            case 'SPAM_TEXT':
                triggerDesc = `Repetir msg \`${rule.trigger_threshold}\` vezes`;
                break;
            case 'MENTION_SPAM':
                triggerDesc = `Mencionar \`${rule.trigger_threshold}\`+ pessoas`;
                break;
        }
    }

    const actions = [];
    if (rule.action_delete_message) actions.push('Apagar Msg');
    if (rule.action_warn_publicly) actions.push('Avisar no Chat');
    if (rule.action_warn_member_dm) actions.push('Avisar por DM');
    
    const punishmentMap = {
        'TIMEOUT': `Silenciar (${rule.action_punishment_duration_minutes || 'N/A'}m)`,
        'KICK': 'Expulsar',
        'BAN': 'Banir'
    };
    if (rule.action_punishment && rule.action_punishment !== 'NONE') {
        actions.push(punishmentMap[rule.action_punishment] || 'Punição Inválida');
    }

    return { trigger: triggerDesc, actions: actions.join(' | ') || 'Nenhuma' };
}

module.exports = function generateGuardianRulesMenu(rules) {
    const ruleComponents = [];

    if (rules.length > 0) {
        rules.forEach(rule => {
            const { trigger, actions } = getRuleInfo(rule);
            ruleComponents.push(
                { "type": 10, "content": `**${rule.is_enabled ? '🟢' : '🔴'} ${rule.name}**\n> **Quando:** ${trigger}\n> **Ações:** ${actions}` },
                { "type": 14, "divider": true, "spacing": 1 }
            );
        });
        ruleComponents.pop();
    } else {
        ruleComponents.push({ "type": 10, "content": "> Nenhuma regra criada ainda. Clique em \"Adicionar Regra\" para começar." });
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
        components: [
            {
                "type": 17, "accent_color": 15105570,
                "components": [
                    { "type": 10, "content": "## 📜 Gerenciador de Regras do Guardian AI" },
                    { "type": 14, "divider": true, "spacing": 1 },
                    ...ruleComponents,
                    { "type": 14, "divider": true, "spacing": 2 },
                    { "type": 1, "components": actionButtons.toJSON().components },
                    { "type": 14, "divider": true, "spacing": 1 },
                    { "type": 1, "components": backButton.toJSON().components }
                ]
            }
        ]
    };
};