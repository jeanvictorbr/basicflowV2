// ui/moderacaoBansMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 5; // Reduzido para evitar o limite de caracteres por página

module.exports = function generateModeracaoBansMenu(allBannedUsers, page = 0) {
    const totalPages = Math.ceil(allBannedUsers.length / ITEMS_PER_PAGE);
    const paginatedBans = allBannedUsers.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const banList = paginatedBans.length > 0
        ? paginatedBans.map(ban => {
            const reason = ban.reason ? `\n> └─ Motivo: *${ban.reason.substring(0, 100)}*` : '';
            return `> 🚫 **${ban.user.tag}** (\`${ban.user.id}\`)${reason}`;
        }).join('\n\n')
        : '> Nenhum membro banido encontrado neste servidor.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mod_bans_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`mod_bans_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 11393254,
            "components": [
                { "type": 10, "content": "## 🚫 Dashboard de Banimentos" },
                { "type": 10, "content": `> Lista de todos os membros banidos do servidor. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": banList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [
                    { "type": 2, "style": 4, "label": "Revogar Ban (por ID)", "emoji": { "name": "🔓" }, "custom_id": "mod_unban_id" },
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "mod_open_premium_hub" }
                ]}
            ].filter(Boolean)
        }
    ];
};