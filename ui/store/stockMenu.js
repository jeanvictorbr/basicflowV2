// Crie em: ui/store/stockMenu.js
module.exports = function generateStockMenu(product, stockCount) {
    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": `## 🔑 Estoque Real: ${product.name}` },
                { "type": 10, "content": `> **Produto ID:** \`${product.id}\`\n> **Itens em Estoque (não reclamados):** \`${stockCount}\`` },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Estoque", "emoji": { "name": "➕" }, "custom_id": `store_add_stock_${product.id}` },
                        { "type": 2, "style": 4, "label": "Remover Estoque", "emoji": { "name": "🗑️" }, "custom_id": `store_remove_stock_${product.id}`, "disabled": stockCount == 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "store_manage_products" }] }
            ]
        }
    ];
};