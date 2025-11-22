// Arquivo: ui/store/categoryConfigMenu.js

module.exports = function categoryConfigMenu(category) {
    const catId = category.id;
    
    // Valores atuais ou padrão
    const currentTitle = category.vitrine_title || `Vitrine: ${category.name}`;
    const currentDesc = category.vitrine_desc || 'Nenhuma descrição definida.';
    const currentColor = category.vitrine_color || '#2b2d31';
    const currentImage = category.vitrine_image ? '✅ Definida' : '❌ Não definida';

    return [
        {
            type: 17, // Layout Rich V2
            accent_color: parseInt(currentColor.replace('#', ''), 16) || 2829617,
            components: [
                // Cabeçalho
                { type: 10, content: `## 🎨 Configuração de Vitrine: ${category.name}` },
                { type: 10, content: `> Personalize como esta categoria aparece para os clientes.` },
                { type: 14, divider: true, spacing: 1 },

                // Seção de Pré-visualização (CORREÇÃO AQUI: Adicionado 'accessory')
                {
                    type: 9, // Lista Horizontal
                    accessory: {
                        type: 2, 
                        style: 2, 
                        label: "Recarregar", 
                        emoji: { name: "🔄" },
                        custom_id: `store_manage_cat_visuals_${catId}` // Recarrega o menu
                    },
                    components: [
                        { type: 10, content: `**Título:** ${currentTitle}` },
                        { type: 10, content: `**Cor:** \`${currentColor}\`` },
                        { type: 10, content: `**Imagem:** ${currentImage}` }
                    ]
                },
                { type: 10, content: `**Descrição:**\n${currentDesc.substring(0, 100)}${currentDesc.length > 100 ? '...' : ''}` },
                
                { type: 14, divider: true, spacing: 2 },

                // Botões de Edição (Abrem Modais)
                {
                    type: 1, // Action Row
                    components: [
                        {
                            type: 2, style: 2, label: "Editar Título", emoji: { name: "✏️" },
                            custom_id: `store_cv_set_title_${catId}`
                        },
                        {
                            type: 2, style: 2, label: "Editar Descrição", emoji: { name: "📝" },
                            custom_id: `store_cv_set_desc_${catId}`
                        }
                    ]
                },
                {
                    type: 1, // Action Row 2
                    components: [
                        {
                            type: 2, style: 2, label: "Alterar Imagem", emoji: { name: "🖼️" },
                            custom_id: `store_cv_set_image_${catId}`
                        },
                        {
                            type: 2, style: 2, label: "Alterar Cor", emoji: { name: "🎨" },
                            custom_id: `store_cv_set_color_${catId}`
                        }
                    ]
                },

                { type: 14, divider: true, spacing: 1 },

                // Ações Principais
                {
                    type: 1, 
                    components: [
                        {
                            type: 2, style: 3, // Green
                            label: "Publicar Vitrine", emoji: { name: "📢" },
                            custom_id: `store_cv_publish_start_${catId}`
                        },
                        {
                            type: 2, style: 2, // Grey
                            label: "Voltar", emoji: { name: "↩️" },
                            custom_id: `open_store_menu`
                        }
                    ]
                }
            ]
        }
    ];
};