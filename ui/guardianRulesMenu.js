// ui/guardianRulesMenu.js
const { EmbedBuilder } = require('discord.js');

function getRuleDescription(rule) {
    let triggerDesc = '';
    switch (rule.trigger_type) {
        case 'TOXICITY':
            triggerDesc = `Se a **toxicidade** for acima de \`${rule.trigger_threshold}%\``;
            break;
        case 'SPAM_TEXT':
            triggerDesc = `Se repetir a mesma mensagem \`${rule.trigger_threshold}\` vezes`;
            break;
        case 'MENTION_SPAM':
            triggerDesc = `Se mencionar \`${rule.trigger_threshold}\`+ pessoas/cargos`;
            break;
    }

    const actions = [];
    if (rule.action_delete_message) actions.push('Apagar Mensagem');
    if (rule.action_warn_member_dm) actions.push('Avisar por DM');
    
    const punishmentMap = {
        'TIMEOUT': `Silenciar por ${rule.action_punishment_duration_minutes || 0} min`,
        'KICK': 'Expulsar',
        'BAN': 'Banir'
    };
    if (rule.action_punishment !== 'NONE') {
        actions.push(punishmentMap[rule.action_punishment] || 'Nenhuma');
    }

    return { trigger: triggerDesc, actions: actions.join(' | ') || 'Nenhuma' };
}

module.exports = function generateGuardianRulesMenu(rules) {
    const embed = new EmbedBuilder()
        .setColor('#E67E22')
        .setTitle('📜 Gerenciador de Regras do Guardian AI')
        .setDescription('Abaixo estão as regras de automação ativas e inativas. Use os botões para gerenciá-las.');

    if (rules.length > 0) {
        rules.forEach(rule => {
            const { trigger, actions } = getRuleDescription(rule);
            embed.addFields({
                name: `${rule.is_enabled ? '🟢' : '🔴'} Regra: ${rule.name}`,
                value: `**Quando:** ${trigger}\n**Ações:** ${actions}`
            });
        });
    } else {
        embed.setDescription('Nenhuma regra criada ainda. Clique em "Adicionar Regra" para começar.');
    }

    const components = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('guardian_rule_add').setLabel('Adicionar Regra').setStyle(ButtonStyle.Success).setEmoji('➕'),
            new ButtonBuilder().setCustomId('guardian_rule_remove').setLabel('Remover Regra').setStyle(ButtonStyle.Danger).setEmoji('🗑️').setDisabled(rules.length === 0),
            new ButtonBuilder().setCustomId('guardian_rule_toggle').setLabel('Ativar/Desativar').setStyle(ButtonStyle.Secondary).setEmoji('🔄').setDisabled(rules.length === 0)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('open_guardian_menu').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️')
        )
    ];

    return { embeds: [embed], components };
};