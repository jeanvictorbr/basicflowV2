// Arquivo: ui/store/categoriesMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 3;

module.exports = function generateCategoriesMenu(categories = [], page = 0) {
    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);
    const paginatedCategories = categories.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    // Mapeamos cada categoria para um bloco visual
    const categoryComponents = paginatedCategories.length > 0
        ? paginatedCategories.flatMap(c => ([
            // Bloco de Informação (Type 9 = Section/List Item)
            // CORREÇÃO: Adicionado o campo 'accessory' que é obrigatório para o Type 9
            {
                type: 9,
                accessory: { 
                    type: 2, 
                    style: 2, // Secondary
                    label: "Gerenciar", 
                    emoji: { name: "🛠️" }, 
                    custom_id: `store_manage_category_products_${c.id}` 
                },
                components: [
                    { type: 10, content: `**📂 ${c.name}** (\`ID: ${c.id}\`)` },
                    { type: 10, content: `> ${c.description || 'Sem descrição.'}` }
                ]
            },
            // Linha de Botões Adicionais (Type 1 = Action Row)
            {
                type: 1,
                components: [
                    { 
                        type: 2, 
                        style: 1, // Primary (Blurple)
                        label: "Configurar Vitrine", 
                        emoji: { name: "🎨" }, 
                        custom_id: `store_manage_cat_visuals_${c.id}`
                    }
                ]
            },
            { type: 14, divider: true, spacing: 1 }
        ]))
        : [{ type: 10, content: '> Nenhuma categoria criada ainda.' }];
    
    // Remove o último divisor se existir
    if (categoryComponents.length > 0 && categoryComponents[categoryComponents.length - 1].type === 14) {
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
                { "type": 10, "content": `> Crie e organize as seções da sua vitrine.\n> Use **Configurar Vitrine** para criar um painel exclusivo para a categoria.` },
                { "type": 14, "divider": true, "spacing": 1 },
                ...categoryComponents,
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Categoria", "emoji": { "name": "➕" }, "custom_id": "store_add_category" },
                        { type: 2, style: 1, label: "Editar Categoria", emoji: { name: "✏️" }, custom_id: "store_edit_category", disabled: categories.length === 0 }, // Botão REMOVER (Novo) 
                        { type: 2, style: 4,  label: "Remover Categoria", emoji: { name: "🗑️" }, custom_id: "store_remove_category", disabled:  true },
                        { "type": 2, "style": 2, "label": "Voltar ao Menu", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }
                    ]
                }
            ].filter(Boolean)
        }
    ];
};