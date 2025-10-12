// Substitua o conteúdo em: ui/store/manageCategoryProductsMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateManageCategoryProductsMenu(category, assignedProducts = [], unassignedProducts = []) {

    const assignedOptions = assignedProducts.map(p => ({
        label: p.name,
        description: `ID do Produto: ${p.id}`,
        value: p.id.toString()
    }));

    const unassignedOptions = unassignedProducts.map(p => ({
        label: p.name,
        description: `ID do Produto: ${p.id}`,
        value: p.id.toString()
    }));

    // CORREÇÃO: Garante que o valor máximo de seleção seja sempre 1 ou mais.
    const maxRemoveValues = Math.max(1, Math.min(25, assignedOptions.length));
    const maxAddValues = Math.max(1, Math.min(25, unassignedOptions.length));

    const removeSelect = new StringSelectMenuBuilder()
        .setCustomId(`select_store_remove_product_from_category_${category.id}`)
        .setPlaceholder('Selecione produtos para REMOVER desta categoria')
        .addOptions(assignedOptions.length > 0 ? assignedOptions : [{ label: 'Nenhum produto para remover.', value: 'none' }])
        .setDisabled(assignedOptions.length === 0)
        .setMinValues(1)
        .setMaxValues(maxRemoveValues);

    const addSelect = new StringSelectMenuBuilder()
        .setCustomId(`select_store_add_product_to_category_${category.id}`)
        .setPlaceholder('Selecione produtos para ADICIONAR a esta categoria')
        .addOptions(unassignedOptions.length > 0 ? unassignedOptions : [{ label: 'Nenhum produto sem categoria.', value: 'none' }])
        .setDisabled(unassignedOptions.length === 0)
        .setMinValues(1)
        .setMaxValues(maxAddValues);

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": `## 📂 Gerenciando Categoria: ${category.name}` },
                { "type": 10, "content": `> Use os menus abaixo para adicionar produtos sem categoria ou remover produtos que já estão aqui.` },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Adicionar Produtos (Sem Categoria):" },
                new ActionRowBuilder().addComponents(addSelect).toJSON(),
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Remover Produtos (Desta Categoria):" },
                new ActionRowBuilder().addComponents(removeSelect).toJSON(),
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": ButtonStyle.Secondary, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "store_manage_categories" }
                    ]
                }
            ]
        }
    ];
};