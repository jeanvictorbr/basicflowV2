// ui/dossieEmbed.js
const { PermissionsBitField } = require('discord.js');

const ITEMS_PER_PAGE = 3;

module.exports = function generateDossieEmbed(member, history, notes, interaction, { historyPage = 0, manageMode = false } = {}) {
    // 1. Resumo com legendas
    const summary = { WARN: 0, TIMEOUT: 0, KICK: 0, BAN: 0 };
    history.forEach(log => {
        if (summary[log.action.toUpperCase()] !== undefined) {
            summary[log.action.toUpperCase()]++;
        }
    });
    const summaryText = `> **Resumo:** ⚠️ Avisos: \`${summary.WARN}\` | 🔇 Silenciamentos: \`${summary.TIMEOUT}\` | 🚪 Expulsões: \`${summary.KICK}\` | 🚫 Banimentos: \`${summary.BAN}\``;

    // 2. Paginação para o Histórico de Moderação
    const totalHistoryPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    const paginatedHistory = history.slice(historyPage * ITEMS_PER_PAGE, (historyPage + 1) * ITEMS_PER_PAGE);
    
    const historyText = paginatedHistory.length > 0
        ? paginatedHistory.map(log => {
            const duration = log.duration ? ` (Duração: ${log.duration})` : '';
            return `> **[${log.action}]** por <@${log.moderator_id}> em <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:d>${duration}\n> └─ Motivo: *${log.reason}*`;
        }).join('\n\n')
        : '> Nenhuma ocorrência encontrada para este membro.';
    
    const notesText = notes.length > 0
        ? notes.slice(0, 3).map(note => {
            return `> 💬 por <@${note.moderator_id}> em <t:${Math.floor(new Date(note.created_at).getTime() / 1000)}:d>\n> └─ *"${note.content}"*`;
        }).join('\n\n')
        : '> Nenhuma nota interna adicionada.';
    
    // ================== CORREÇÃO APLICADA AQUI ==================
    const historyPaginationRow = totalHistoryPages > 1 ? {
        "type": 1, "components": [
            { "type": 2, "style": 2, "label": "Anterior", "custom_id": `mod_dossie_history_page_${member.id}_${historyPage - 1}`, "disabled": historyPage === 0 },
            { "type": 2, "style": 2, "label": `Página ${historyPage + 1} de ${totalHistoryPages}`, "custom_id": "disabled_page_button", "disabled": true },
            { "type": 2, "style": 2, "label": "Próxima", "custom_id": `mod_dossie_history_page_${member.id}_${historyPage + 1}`, "disabled": historyPage + 1 >= totalHistoryPages }
        ]
    } : null;
    // =============================================================

    // Lógica para alternar entre botões de ação e gerenciamento
    const canPunish = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || (member.roles.highest.position < interaction.member.roles.highest.position);
    
    let actionComponents;
    if (manageMode) {
        actionComponents = [
            { "type": 1, "components": [
                { "type": 2, "style": 2, "label": "Remover Nota", "emoji": { "name": "🗒️" }, "custom_id": `mod_dossie_remove_note_${member.id}`, "disabled": notes.length === 0 },
                { "type": 2, "style": 2, "label": "Remover Ocorrência", "emoji": { "name": "📋" }, "custom_id": `mod_dossie_remove_log_${member.id}`, "disabled": history.length === 0 }
            ]},
            { "type": 1, "components": [
                { "type": 2, "style": 4, "label": "Resetar Histórico", "emoji": { "name": "🗑️" }, "custom_id": `mod_dossie_reset_history_${member.id}`, "disabled": history.length === 0 },
                { "type": 2, "style": 1, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": `mod_dossie_manage_back_${member.id}` }
            ]}
        ];
    } else {
        actionComponents = [
            { "type": 1, "components": [
                { "type": 2, "style": 3, "label": "Aplicar Punição", "emoji": { "name": "⚖️" }, "custom_id": `mod_aplicar_punicao_${member.id}`, "disabled": !canPunish },
                { "type": 2, "style": 1, "label": "Adicionar Nota", "emoji": { "name": "📝" }, "custom_id": `mod_adicionar_nota_${member.id}` },
                { "type": 2, "style": 2, "label": "Gerenciar", "emoji": { "name": "🛠️" }, "custom_id": `mod_dossie_manage_${member.id}` }
            ]},
            { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub", "emoji": { "name": "↩️" }, "custom_id": "mod_open_hub" }] }
        ];
    }

    const components = [
        {
            "type": 17, "accent_color": 15158332,
            "components": [
                { "type": 9, "accessory": { "type": 11, "media": { "url": member.user.displayAvatarURL({ size: 128 }) } },
                  "components": [
                      { "type": 10, "content": `## Dossiê de ${member.user.username}` },
                      { "type": 10, "content": `> **ID:** \`${member.id}\`\n> **Juntou-se em:** <t:${Math.floor(member.joinedTimestamp / 1000)}:f>` }
                  ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": summaryText },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": `### Histórico de Moderação (${history.length} total)` },
                { "type": 10, "content": historyText },
                historyPaginationRow,
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": `### Notas Internas da Staff (${notes.length} total)` },
                { "type": 10, "content": notesText },
                { "type": 14, "divider": true, "spacing": 2 },
                ...actionComponents
            ].filter(Boolean)
        }
    ];
    return { components };
};