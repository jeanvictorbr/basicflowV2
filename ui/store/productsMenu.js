// Substitua o conteúdo em: ui/store/productsMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const ITEMS_PER_PAGE = 3; 

module.exports = function generateProductsMenu(products = [], page = 0) {
    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const paginatedProducts = products.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const productList = paginatedProducts.length > 0
        ? paginatedProducts.map(p => {
            const price = `R$ ${parseFloat(p.price).toFixed(2)}`;
            const stock = p.stock === -1 ? 'Infinito' : p.stock;
            const status = p.is_enabled ? '✅' : '❌';
            // CORREÇÃO: O texto agora é dinâmico com base no p.stock_type
            const stockLabel = p.stock_type === 'REAL' ? 'Estoque Real' : 'Estoque Fictício';
            return `> ${status} **${p.name}** (\`ID: ${p.id}\`)\n> └─ **Preço:** \`${price}\` | **${stockLabel}:** \`${stock}\``;
        }).join('\n\n')
        : '> Nenhum produto cadastrado ainda.';

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`store_products_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`store_products_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 📦 Gerenciador de Produtos" },
                { "type": 10, "content": `> Adicione, edite ou remova os itens do seu catálogo. Página ${page + 1} de ${totalPages || 1}.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": productList },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : null,
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Produto", "emoji": { "name": "➕" }, "custom_id": "store_add_product" },
                        { "type": 2, "style": 1, "label": "Editar Produto", "emoji": { "name": "✏️" }, "custom_id": "store_edit_product", "disabled": products.length === 0 },
                        { "type": 2, "style": 4, "label": "Remover Produto", "emoji": { "name": "🗑️" }, "custom_id": "store_remove_product", "disabled": products.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Gerir Estoque Real", "emoji": { "name": "🔑" }, "custom_id": "store_manage_stock", "disabled": products.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }] }
            ].filter(Boolean)
        }
    ];
};