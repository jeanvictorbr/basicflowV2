// Substitua em: ui/minhasAcoesEmbed.js
module.exports = function generateMinhasAcoesEmbed(interaction, history, page = 0) {
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    const paginatedHistory = history.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const historyText = paginatedHistory.length > 0
        ? paginatedHistory.map(log => {
            const duration = log.duration ? ` (Duração: ${log.duration})` : '';
            // CORRIGIDO: O texto agora especifica o alvo da ação
            return `> **[${log.action}]** aplicado a <@${log.user_id}> em <t:${Math.floor(new Date(log.created_at).getTime() / 1000)}:R>${duration}\n> └─ Motivo: *${log.reason}*`;
        }).join('\n\n')
        : '> Você ainda não realizou nenhuma ação de moderação.';
        
    const paginationButtons = {
        "type": 1,
        "components": [
            { "type": 2, "style": 2, "label": "Anterior", "custom_id": `mod_minhas_acoes_page_${page - 1}`, "disabled": page === 0 },
            { "type": 2, "style": 2, "label": "Próxima", "custom_id": `mod_minhas_acoes_page_${page + 1}`, "disabled": page + 1 >= totalPages }
        ]
    };

    return [
        {
            "type": 17, "accent_color": 3447003,
            "components": [
                { "type": 10, "content": `## 📋 Minhas Ações de Moderação Recentes` },
                { "type": 10, "content": `> Exibindo suas últimas ${history.length} ações. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": historyText },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? paginationButtons : null,
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub", "emoji": { "name": "↩️" }, "custom_id": "mod_open_hub" }] }
            ].filter(Boolean)
        }
    ];
};