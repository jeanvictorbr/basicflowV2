// Substitua em: ui/store/categoryRemovePanel.js
module.exports = function generateCategoryRemovePanel(category) {
    return [
        {
            type: 17,
            components: [
                { type: 10, content: `> **🗑️ Excluir Categoria:** ${category.name}` },
                { type: 10, content: `> **ID:** \`${category.id}\`\n> **Atenção:**\n> 1. A categoria será apagada do banco de dados.\n> 2. A mensagem da vitrine no canal será apagada.\n> 3. Os produtos desta categoria ficarão "Sem Categoria".` },
                { type: 14, divider: true, spacing: 2 },
                {
                    type: 1,
                    components: [
                        // Botão Confirmar (Chama o handler corrigido acima)
                        { 
                            type: 2, style: 4, // Danger
                            label: "CONFIRMAR EXCLUSÃO", 
                            emoji: { name: "🗑️" }, 
                            custom_id: `store_confirm_delete_cat_${category.id}` 
                        },
                        // Botão Cancelar (CORRIGIDO: Volta para Gerenciar Categorias)
                        { 
                            type: 2, style: 2, // Secondary
                            label: "Cancelar / Voltar", 
                            emoji: { name: "↩️" }, 
                            custom_id: "store_manage_categories" // <--- AQUI ESTAVA O ERRO
                        }
                    ]
                }
            ]
        }
    ];
};