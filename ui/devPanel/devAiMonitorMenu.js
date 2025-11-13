// Substitua o conteúdo em: ui/devPanel/devAiMonitorMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ITEMS_PER_PAGE = 1; // 1 log por página para melhor visualização

module.exports = function generateDevAiMonitorMenu(logs = [], page = 0, total, view) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const paginatedLogs = logs; // A query já vai trazer apenas 1

    const logDisplay = paginatedLogs.length > 0
        ? paginatedLogs.map(log => {
            const prompt = log.prompt_text ? `\`\`\`json\n${log.prompt_text.substring(0, 800)}\n\`\`\`` : '`N/A`';
            const response = log.response_text ? `\`\`\`\n${log.response_text.substring(0, 800)}\n\`\`\`` : '`N/A`';
            return `> **Servidor:** \`${log.guild_id}\`\n` +
                   `> **Usuário:** <@${log.user_id}> (\`${log.user_id}\`)\n` +
                   `> **Feature:** \`${log.feature_name}\`\n` +
                   `> **Custo:** \`$${parseFloat(log.cost).toFixed(8)}\` | **Tokens:** \`${log.total_tokens}\`\n` +
                   `> **Data:** <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:R>\n\n` +
                   `**PROMPT ENVIADO:**${prompt}\n` +
                   `**RESPOSTA RECEBIDA:**${response}`;
        }).join('\n\n')
        : '> Nenhum log de atividade da IA encontrado.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_ai_log_page_${view}_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`dev_ai_log_page_${view}_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    const viewButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dev_ai_monitor_show_general').setLabel('Log Geral').setStyle(ButtonStyle.Secondary).setDisabled(view === 'general'),
        new ButtonBuilder().setCustomId('dev_ai_monitor_show_guardian').setLabel('Log Guardian').setStyle(ButtonStyle.Secondary).setDisabled(view === 'guardian')
    );

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": `## 🧠 Monitor de Atividade da IA (${view === 'general' ? 'Geral' : 'Guardian'})` },
                { "type": 10, "content": `> Visualizando ${paginatedLogs.length} de ${total} registros. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": viewButtons.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": logDisplay },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                { "type": 1, "components": [
                    // CORREÇÃO: custom_id alterado para 'dev_main_menu_back'
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "dev_main_menu_back" }
                ] }
            ].filter(Boolean)
        }
    ];
};