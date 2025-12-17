// ui/ticketsAiMenu.js
module.exports = function generateAiMenu(settings) {
    const systemStatus = settings.tickets_ai_assistant_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleSystemButton = settings.tickets_ai_assistant_enabled ? { label: 'Desativar Assistente', style: 4 } : { label: 'Ativar Assistente', style: 3 };

    // Lógica para o novo botão de toggle do conhecimento base
    const baseKnowledgeStatus = settings.tickets_ai_use_base_knowledge !== false ? '✅ Ativado' : '❌ Desativado';
    const toggleBaseKnowledgeButton = settings.tickets_ai_use_base_knowledge !== false ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };

    const promptStatus = settings.tickets_ai_assistant_prompt ? '✅ Definido' : '❌ Usando prompt padrão';

    return [
        {
            "type": 17, "accent_color": 8421504,
            "components": [
                { "type": 10, "content": "## 🤖 Gerenciador do Assistente de IA" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleSystemButton.style, "label": toggleSystemButton.label, "custom_id": "tickets_ai_toggle_system" },
                    "components": [{ "type": 10, "content": `**Assistente de IA**\n> Status: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleBaseKnowledgeButton.style, "label": toggleBaseKnowledgeButton.label, "custom_id": "tickets_ai_toggle_base_knowledge" },
                    "components": [{ "type": 10, "content": `**Usar Conhecimento Fixo do BasicFlow**\n> Status: \`${baseKnowledgeStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Editar Instruções", "emoji": { "name": "✏️" }, "custom_id": "tickets_ai_edit_prompt" },
                    "components": [{ "type": 10, "content": `**Instruções da IA (Prompt)**\n> Status: \`${promptStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Gerenciar Memória", "emoji": { "name": "📚" }, "custom_id": "tickets_ai_manage_knowledge" },
                    "components": [{ "type": 10, "content": `**Base de Conhecimento Personalizada**\n> Adicione informações específicas do seu servidor.` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub Premium", "emoji": { "name": "↩️" }, "custom_id": "tickets_open_premium_menu" }]
                }
            ]
        }
    ];
};