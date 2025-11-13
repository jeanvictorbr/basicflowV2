/**
 * Gera o menu de histórico de ativações (V2)
 */
function generateDevKeyHistoryMenu(history, page, totalItems, totalPages) {
    
    let historyText = "Nenhum registro de ativação encontrado.";

    if (history.length > 0) {
        historyText = history.map(h => {
            // Formata a data (BR)
            const date = h.activated_at ? new Date(h.activated_at).toLocaleString('pt-BR') : 'Data desconhecida';
            
            return `> 📅 **${date}**\n` +
                   `> 🔑 \`${h.key}\`\n` +
                   `> 👤 <@${h.user_id}> (\`${h.user_tag || h.user_id}\`)\n` +
                   `> 🏢 **${h.guild_name || 'Servidor'}** (\`${h.guild_id}\`)`;
        }).join('\n\n');
    }

    return {
        type: 17,
        accent_color: 3447003, // Azul
        components: [
            { 
                type: 10, 
                content: `## 📜 Histórico de Ativações\nExibindo **${history.length}** de **${totalItems}** registros.` 
            },
            { type: 14, divider: true, spacing: 2 },
            { 
                type: 10, 
                content: historyText 
            },
            { type: 14, divider: true, spacing: 2 },
            // Navegação
            {
                type: 1,
                components: [
                    { type: 2, style: 1, label: 'Anterior', custom_id: `dev_key_history_page_${page - 1}`, disabled: page === 0 },
                    { type: 2, style: 2, label: `Página ${page + 1}/${totalPages}`, custom_id: 'noop', disabled: true },
                    { type: 2, style: 1, label: 'Próxima', custom_id: `dev_key_history_page_${page + 1}`, disabled: page + 1 >= totalPages },
                    { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'dev_manage_keys' }
                ]
            },
            // Ações de Limpeza (Opcional)
            {
                type: 1,
                components: [
                    { type: 2, style: 4, label: 'Limpar Histórico Antigo', emoji: { name: '🗑️' }, custom_id: 'dev_key_history_clear' }
                ]
            }
        ]
    };
}

module.exports = generateDevKeyHistoryMenu;