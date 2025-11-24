// Substitua em: ui/store/categoryManageHub.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateCategoryManageHub(category, productCount) {
    return [
        {
            type: 17,
            components: [
                { type: 10, content: `> **📂 Gerenciar Categoria:** ${category.name}` },
                { type: 10, content: `> **ID:** \`${category.id}\`\n> **Produtos Vinculados:** ${productCount}` },
                { type: 10, content: `> **VOCÊ SÓ PODE ADICIONAR 25 PRODUTOS POR CATEGORIA!**`},
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1,
                    components: [
                        // Botão NOVO: Gerenciar Detalhes (Edição)
                        { 
                            type: 2, style: 1, // Primary (Azul)
                            label: "Editar Produtos da Categoria", 
                            emoji: { name: "📝" }, 
                            custom_id: `store_cat_launch_edit_${category.id}`,
                            disabled: productCount == 0
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        // Botão Adicionar (Verde)
                        { 
                            type: 2, style: 3, 
                            label: "Adicionar Produtos", 
                            emoji: { name: "➕" }, 
                            custom_id: `store_cat_launch_add_${category.id}` 
                        },
                        // Botão Remover (Vermelho)
                        { 
                            type: 2, style: 4, 
                            label: "Remover Produtos", 
                            emoji: { name: "➖" }, 
                            custom_id: `store_cat_launch_remove_${category.id}`,
                            disabled: productCount == 0
                        }
                    ]
                },
                { type: 14, divider: true, spacing: 1 },
                {
                    type: 1,
                    components: [
                        { type: 2, style: 2, label: "Voltar", emoji: { name: "↩️" }, custom_id: "store_manage_categories" }
                    ]
                }
            ]
        }
    ];
};