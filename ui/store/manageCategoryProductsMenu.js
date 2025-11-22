// File: ui/store/manageCategoryProductsMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateManageCategoryProductsMenu(category, assignedProducts = [], unassignedProducts = []) {

    const assignedOptions = assignedProducts.map(p => ({
        label: p.name,
        description: `ID: ${p.id} | R$ ${p.price || '?'},00`,
        value: p.id.toString(),
        emoji: { name: "❌" }
    }));

    const unassignedOptions = unassignedProducts.map(p => ({
        label: p.name,
        description: `ID: ${p.id} | R$ ${p.price || '?'},00`,
        value: p.id.toString(),
        emoji: { name: "➕" }
    }));

    // --- CORREÇÃO: Seleção Única (1 por vez) para atualização imediata ---
    const removeSelect = new StringSelectMenuBuilder()
        .setCustomId(`select_store_cat_unlink_${category.id}`) 
        .setPlaceholder('Selecione 1 produto para REMOVER')
        .addOptions(assignedOptions.length > 0 ? assignedOptions : [{ label: 'Nenhum produto para remover.', value: 'none' }])
        .setDisabled(assignedOptions.length === 0)
        .setMinValues(1)
        .setMaxValues(1); // <--- MUDOU PARA 1

    const addSelect = new StringSelectMenuBuilder()
        .setCustomId(`select_store_add_product_to_category_${category.id}`)
        .setPlaceholder('Selecione 1 produto para ADICIONAR')
        .addOptions(unassignedOptions.length > 0 ? unassignedOptions : [{ label: 'Nenhum produto sem categoria.', value: 'none' }])
        .setDisabled(unassignedOptions.length === 0)
        .setMinValues(1)
        .setMaxValues(1); // <--- MUDOU PARA 1

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": `## 📂 Gerenciando Categoria: ${category.name}` },
                { "type": 10, "content": `> Ações de adicionar/remover atualizam a vitrine automaticamente.` },
                
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📥 Adicionar à Categoria:" },
                new ActionRowBuilder().addComponents(addSelect).toJSON(),
                
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### 📤 Remover da Categoria (Desvincular):" },
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