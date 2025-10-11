// Crie em: ui/store/couponsMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 5;

module.exports = function generateCouponsMenu(coupons = [], page = 0) {
    const totalPages = Math.ceil(coupons.length / ITEMS_PER_PAGE);
    const paginatedCoupons = coupons.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const couponList = paginatedCoupons.length > 0
        ? paginatedCoupons.map(c => {
            const status = c.is_active ? '✅' : '❌';
            return `> ${status} **\`${c.code}\`**\n> └─ **Desconto:** \`${c.discount_percent}%\` | **Usos Restantes:** \`${c.uses_left}\``;
        }).join('\n\n')
        : '> Nenhum cupom criado ainda.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`store_coupons_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`store_coupons_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 🎟️ Gerenciador de Cupons de Desconto" },
                { "type": 10, "content": `> Crie e gerencie os cupons da sua loja. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": couponList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Cupom", "emoji": { "name": "➕" }, "custom_id": "store_add_coupon" },
                        { "type": 2, "style": 4, "label": "Remover Cupom", "emoji": { "name": "🗑️" }, "custom_id": "store_remove_coupon", "disabled": coupons.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }] }
            ].filter(Boolean)
        }
    ];
};