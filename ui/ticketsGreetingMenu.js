// Crie em: ui/ticketsGreetingMenu.js
module.exports = function generateGreetingMenu(settings) {
    const systemStatus = settings.tickets_greeting_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.tickets_greeting_enabled
        ? { label: 'Desativar Saudação', style: 4, emoji: '✖️' }
        : { label: 'Ativar Saudação', style: 3, emoji: '✔️' };

    const currentMessage = settings.tickets_greeting_message || 'Nenhuma mensagem definida.';

    return [
        {
            "type": 17, "accent_color": 5752042,
            "components": [
                { "type": 10, "content": "## 💬 Gerenciador de Saudação" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "emoji": { "name": toggleButton.emoji }, "custom_id": "tickets_greeting_toggle" },
                    "components": [{ "type": 10, "content": `**Saudação Automática**\n> Status: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Mensagem Atual:" },
                { "type": 10, "content": `>>> ${currentMessage}` },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 1, "label": "Editar Mensagem", "emoji": { "name": "✏️" }, "custom_id": "tickets_greeting_edit" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar ao Hub Premium", "emoji": { "name": "↩️" }, "custom_id": "tickets_open_premium_menu" }]
                }
            ]
        }
    ];
};