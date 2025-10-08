// ui/moderacaoPunicoesAtivasMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 3;

module.exports = function generateModeracaoPunicoesAtivasMenu(sanctions, page = 0) {
    const totalPages = Math.ceil(sanctions.length / ITEMS_PER_PAGE);
    const paginatedSanctions = sanctions.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const sanctionList = paginatedSanctions.length > 0
        ? paginatedSanctions.map(s => {
            if (s.type === 'PUNISHMENT') {
                const actionEmoji = s.action === 'BAN' ? '🚫' : '🔇';
                return `> ${actionEmoji} **<@${s.userId}>** (\`${s.action}\`)\n` +
                       `> └─ **Expira:** <t:${Math.floor(s.expiresAt / 1000)}:R>\n` +
                       `> └─ **Motivo:** *${s.reason}* (ID: ${s.id})`;
            }
            if (s.type === 'INFRACTION') {
                return `> 🛡️ **<@${s.userId}>** (Infração)\n` +
                       `> └─ **Detalhes:** ${s.details}\n` +
                       `> └─ **Reseta:** <t:${Math.floor(s.expiresAt / 1000)}:R> (ID: ${s.id})`;
            }
            return '';
        }).join('\n\n')
        : '> Nenhuma punição ou infração temporária ativa no momento.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`mod_punicoes_ativas_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`mod_punicoes_ativas_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 11393254,
            "components": [
                { "type": 10, "content": "## ⏳ Dashboard de Sanções Ativas" },
                { "type": 10, "content": `> Lista de punições e infrações temporárias ativas. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": sanctionList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [
                    { "type": 2, "style": 4, "label": "Revogar Sanção", "emoji": { "name": "🔓" }, "custom_id": "mod_revogar_punicao", "disabled": sanctions.length === 0 },
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "mod_open_premium_hub" }
                ]}
            ].filter(Boolean)
        }
    ];
};