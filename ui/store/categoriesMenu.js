// Substitua em: ui/store/categoriesMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 3; // Reduzido para caber os botões

module.exports = function generateCategoriesMenu(categories = [], page = 0) {
    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const paginatedCategories = categories.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const categoryComponents = paginatedCategories.length > 0
        ? paginatedCategories.flatMap(c => ([
            {
                type: 9,
                accessory: { type: 2, style: 2, label: "Gerenciar", emoji: { name: "🛠️" }, custom_id: `store_manage_category_products_${c.id}` },
                components: [
                    { type: 10, content: `**📂 ${c.name}** (\`ID: ${c.id}\`)` },
                    { type: 10, content: `> ${c.description || 'Sem descrição.'}` }
                ]
            },
            { type: 14, divider: true, spacing: 1 }
        ]))
        : [{ type: 10, content: '> Nenhuma categoria criada ainda.' }];
    
    if (categoryComponents.length > 1 && categoryComponents[categoryComponents.length - 1].type === 14) {
        categoryComponents.pop();
    }

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`store_categories_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`store_categories_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 📂 Gerenciador de Categorias da Loja" },
                { "type": 10, "content": `> Crie e organize as seções da sua vitrine. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                ...categoryComponents,
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar", "emoji": { "name": "➕" }, "custom_id": "store_add_category" },
                        { "type": 2, "style": 1, "label": "Editar", "emoji": { "name": "✏️" }, "custom_id": "store_edit_category", "disabled": categories.length === 0 },
                        { "type": 2, "style": 4, "label": "Remover", "emoji": { "name": "🗑️" }, "custom_id": "store_remove_category", "disabled": categories.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }] }
            ].filter(Boolean)
        }
    ];
};