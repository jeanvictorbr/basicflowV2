// Substitua o conteúdo em: ui/dossieEmbed.js
const hasFeature = require('../utils/featureCheck.js');
const ITEMS_PER_PAGE = 3; // Reduzido para evitar sobrecarga de texto em V2

module.exports = async function generateDossieEmbed(interaction, member, history, notes, page = 0, options = {}) {
    const targetUser = member.user;
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    const paginatedLogs = history.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const historyText = paginatedLogs.length > 0
        ? paginatedLogs.map(log => `> **[${log.action}]** por <@${log.moderator_id}> em <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:R>\n> └─ Motivo: *${log.reason}*`).join('\n\n')
        : '> Nenhum histórico de punições encontrado.';

    const notesText = notes.length > 0
        ? notes.map(note => `> **Nota de <@${note.moderator_id}>** em <t:${Math.floor(new Date(note.created_at).getTime() / 1000)}:R>\n> └─ *${note.content}*`).join('\n')
        : '> Nenhuma nota interna encontrada.';

    let actionButtons = [];
    if (options.manageMode) {
        actionButtons = [{
            "type": 1, "components": [
                { "type": 2, "style": 2, "label": "Remover Ocorrência", "emoji": { "name": "📋" }, "custom_id": `mod_dossie_remove_log_${targetUser.id}`, "disabled": history.length === 0 },
                { "type": 2, "style": 2, "label": "Remover Nota", "emoji": { "name": "📝" }, "custom_id": `mod_dossie_remove_note_${targetUser.id}`, "disabled": notes.length === 0 },
                { "type": 2, "style": 4, "label": "Resetar Histórico", "emoji": { "name": "🗑️" }, "custom_id": `mod_dossie_reset_history_${targetUser.id}`, "disabled": history.length === 0 },
            ]},
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 1, "components": [{ "type": 2, "style": 1, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": `mod_dossie_cancel_${targetUser.id}` }]
        }];
    } else if (options.actionComponents) {
        actionButtons = options.actionComponents;
    } else {
        const hasAIAccess = await hasFeature(interaction.guild.id, 'DOSSIE_AI_ANALYSIS');
        actionButtons = [{
            "type": 1, "components": [
                { "type": 2, "style": 3, "label": "Aplicar Punição", "emoji": { "name": "⚖️" }, "custom_id": `mod_aplicar_punicao_${targetUser.id}` },
                { "type": 2, "style": 2, "label": "Adicionar Nota", "emoji": { "name": "📝" }, "custom_id": `mod_adicionar_nota_${targetUser.id}` },
                { "type": 2, "style": 4, "label": "Gerenciar Histórico", "emoji": { "name": "🛠️" }, "custom_id": `mod_dossie_manage_${targetUser.id}` }
            ]},
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 1, "components": [
                 { "type": 2, "style": 1, "label": "Analisar (IA)", "emoji": { "name": "🧠" }, "custom_id": `mod_dossie_analyze_${targetUser.id}`, "disabled": !hasAIAccess },
                 { "type": 2, "style": 2, "label": "Voltar ao Hub", "emoji": { "name": "↩️" }, "custom_id": "mod_open_hub" }
            ]}
        ];
    }
    
    const paginationButtons = {
        "type": 1, "components": [
            { "type": 2, "style": 2, "label": "Anterior", "custom_id": `mod_minhas_acoes_page_${page - 1}`, "disabled": page === 0 },
            { "type": 2, "style": 2, "label": "Próxima", "custom_id": `mod_minhas_acoes_page_${page + 1}`, "disabled": page + 1 >= totalPages }
        ]
    };

    return {
        components: [{
            "type": 17, "accent_color": 15158332,
            "components": [
                { "type": 10, "content": `## ⚖️ Dossiê de Moderação`},
                { "type": 10, "content": `> Exibindo o perfil de **${targetUser.tag}** (\`${targetUser.id}\`)` },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": "### 📋 Histórico de Punições" },
                { "type": 10, "content": historyText },
                totalPages > 1 ? { "type": 14, "divider": true, "spacing": 1 } : null,
                totalPages > 1 ? paginationButtons : null,
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": "### 📝 Notas Internas da Staff" },
                { "type": 10, "content": notesText },
                { "type": 14, "divider": true, "spacing": 2 },
                ...actionButtons
            ].filter(Boolean)
        }]
    };
};