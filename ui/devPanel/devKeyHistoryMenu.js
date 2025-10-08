// Crie em: ui/devPanel/devKeyHistoryMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 3;

module.exports = function generateDevKeyHistoryMenu(history, page = 0) {
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    const paginatedHistory = history.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const historyList = paginatedHistory.length > 0
        ? paginatedHistory.map(entry => {
            return `> **Chave:** \`${entry.key}\` (ID: ${entry.id})\n` +
                   `> ├─ **Features:** \`${entry.grants_features}\`\n` +
                   `> ├─ **Guild:** ${entry.guild_name} (\`${entry.guild_id}\`)\n` +
                   `> └─ **Ativada por:** ${entry.user_tag} em <t:${Math.floor(new Date(entry.activated_at).getTime() / 1000)}:f>`;
        }).join('\n\n')
        : '> Nenhum histórico de ativação de chaves encontrado.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_key_history_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`dev_key_history_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 📜 Histórico de Ativação de Chaves" },
                { "type": 10, "content": `> Registros de todas as chaves utilizadas. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": historyList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                { "type": 1, "components": [
                    { "type": 2, "style": 4, "label": "Limpar Histórico", "emoji": { "name": "🗑️" }, "custom_id": "dev_key_history_clear", "disabled": history.length === 0 },
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "dev_manage_keys" }
                ]}
            ].filter(Boolean)
        }
    ];
};