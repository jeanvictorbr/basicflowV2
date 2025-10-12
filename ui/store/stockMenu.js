// Substitua o conteúdo em: ui/store/stockMenu.js
module.exports = function generateStockMenu(product, stockCount) {
    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": `## 🔑 Estoque Real: ${product.name}` },
                { "type": 10, "content": `> **Produto ID:** \`${product.id}\`\n> **Itens em Estoque (não vendidos):** \`${stockCount}\`` },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Estoque", "emoji": { "name": "➕" }, "custom_id": `store_add_stock_${product.id}` },
                        // BOTÃO ALTERADO DE "REMOVER" PARA "EDITAR"
                        { "type": 2, "style": 1, "label": "Editar Estoque", "emoji": { "name": "✏️" }, "custom_id": `store_edit_stock_${product.id}`, "disabled": stockCount == 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "store_manage_products" }] }
            ]
        }
    ];
};