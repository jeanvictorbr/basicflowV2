// ui/devPanel/devKeysMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 5;

module.exports = function generateDevKeysMenu(keys, page = 0) {
    const totalPages = Math.ceil(keys.length / ITEMS_PER_PAGE);
    const paginatedKeys = keys.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const keyList = paginatedKeys.length > 0
        ? paginatedKeys.map(key => {
            const features = `\`${key.grants_features || 'N/A'}\``;
            return `> 🔑 **Chave:** \`${key.key}\`\n` +
                   `> └─ **Features:** ${features}\n` +
                   `> └─ **Duração:** ${key.duration_days} dias | **Usos:** ${key.uses_left}`;
        }).join('\n\n')
        : '> Nenhuma chave de ativação foi criada ainda.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_keys_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`dev_keys_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 🔑 Gerenciador de Chaves Ativas" }, // Título alterado
                { "type": 10, "content": `> Crie e revogue chaves para gerenciar o acesso. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": keyList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                { "type": 1, "components": [
                    { "type": 2, "style": 3, "label": "Criar Nova Chave", "emoji": { "name": "➕" }, "custom_id": "dev_key_create" },
                    { "type": 2, "style": 4, "label": "Revogar Chave", "emoji": { "name": "🗑️" }, "custom_id": "dev_key_revoke", "disabled": keys.length === 0 }
                ]},
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [
                    // --- NOVO BOTÃO DE HISTÓRICO ---
                    { "type": 2, "style": 1, "label": "Ver Histórico de Uso", "emoji": { "name": "📜" }, "custom_id": "dev_open_key_history" },
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "devpanel" }
                ]}
            ].filter(Boolean)
        }
    ];
};