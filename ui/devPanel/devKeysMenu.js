/**
 * Gera o menu de chaves no formato V2 (JSON Type 17)
 */
function generateDevKeysMenu(keys, page, totalKeys, totalPages) {
    
    let keysListText = "Nenhuma chave ativa encontrada.";

    if (keys.length > 0) {
        // Formata a lista de chaves com destaque
        keysListText = keys.map(k => {
            let features = k.grants_features;
            // Mostra a CHAVE (k.key) explicitamente
            return `> 🔑 **KEY:** \`${k.key}\`\n> └─ ⏳ ${k.duration_days} dias • 👥 Usos Restantes: ${k.uses_left} • 🎁 ${features}`;
        }).join('\n\n');
    }

    return {
        type: 17, // Container V2
        accent_color: 3447003, // Azul (Blue)
        components: [
            { 
                type: 10, 
                content: `## 🔑 Gerenciador de Chaves Premium\nExibindo **${keys.length}** de **${totalKeys}** chaves ativas.` 
            },
            { type: 14, divider: true, spacing: 2 },
            { 
                type: 10, 
                content: keysListText 
            },
            { type: 14, divider: true, spacing: 2 },
            // Botões de Ação
            {
                type: 1,
                components: [
                    { type: 2, style: 3, label: 'Criar Aleatória', emoji: { name: '🎲' }, custom_id: 'dev_key_create' },
                    // NOVO BOTAO PERSONALIZADO
                    { type: 2, style: 1, label: 'Criar Personalizada', emoji: { name: '✏️' }, custom_id: 'dev_key_create_custom' },
                    { type: 2, style: 1, label: 'Massa (Bulk)', emoji: { name: '📦' }, custom_id: 'dev_open_bulk_keys' }
                ]
            },
            // Botões Secundários
            {
                type: 1,
                components: [
                    { type: 2, style: 4, label: 'Revogar', emoji: { name: '✖️' }, custom_id: 'dev_key_revoke' },
                    { type: 2, style: 2, label: 'Histórico', emoji: { name: '📜' }, custom_id: 'dev_open_key_history' },
                    // Adicionei botão de atualizar para facilitar
                    { type: 2, style: 2, label: 'Atualizar', emoji: { name: '🔄' }, custom_id: 'dev_manage_keys' }
                ]
            },
            // Navegação
            {
                type: 1,
                components: [
                    { type: 2, style: 1, label: 'Anterior', custom_id: `dev_keys_page_${page - 1}`, disabled: page === 0 },
                    { type: 2, style: 2, label: `Página ${page + 1}/${totalPages}`, custom_id: 'noop', disabled: true },
                    { type: 2, style: 1, label: 'Próxima', custom_id: `dev_keys_page_${page + 1}`, disabled: page + 1 >= totalPages },
                    { type: 2, style: 2, label: 'Voltar', emoji: { name: '⬅️' }, custom_id: 'dev_main_menu_back' }
                ]
            }
        ]
    };
}

module.exports = generateDevKeysMenu;