// Crie em: ui/ticketsAiMenu.js
module.exports = function generateAiMenu(settings) {
    const systemStatus = settings.tickets_ai_assistant_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.tickets_ai_assistant_enabled
        ? { label: 'Desativar Assistente', style: 4, emoji: '✖️' }
        : { label: 'Ativar Assistente', style: 3, emoji: '✔️' };

    const promptStatus = settings.tickets_ai_assistant_prompt ? '✅ Definido' : '❌ Usando prompt padrão';

    return [
        {
            "type": 17, "accent_color": 8421504,
            "components": [
                { "type": 10, "content": "## 🤖 Gerenciador do Assistente de IA" },
                { "type": 10, "content": "> A IA irá ler a primeira mensagem do usuário no ticket e tentar oferecer uma solução inicial ou pedir mais detalhes." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "emoji": { "name": toggleButton.emoji }, "custom_id": "tickets_ai_toggle_system" },
                    "components": [{ "type": 10, "content": `**Assistente de IA**\n> Status: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Editar Instruções", "emoji": { "name": "✏️" }, "custom_id": "tickets_ai_edit_prompt" },
                    "components": [{ "type": 10, "content": `**Instruções da IA (Prompt)**\n> Status: \`${promptStatus}\`` }]
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