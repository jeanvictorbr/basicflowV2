// ui/ticketsGreetingMenu.js
module.exports = function generateGreetingMenu(settings, messages) {
    const systemStatus = settings.tickets_greeting_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.tickets_greeting_enabled
        ? { label: 'Desativar Saudações', style: 4, emoji: '✖️' }
        : { label: 'Ativar Saudações', style: 3, emoji: '✔️' };

    const messageList = messages.length > 0
        ? messages.map(m => `> ${m.is_active ? '🟢' : '🔴'} **[ID: ${m.id}]** ${m.message.substring(0, 70)}${m.message.length > 70 ? '...' : ''}`).join('\n')
        : '> Nenhuma mensagem configurada.';

    return [
        {
            "type": 17, "accent_color": 5752042,
            "components": [
                { "type": 10, "content": "## 💬 Gerenciador de Saudações" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "emoji": { "name": toggleButton.emoji }, "custom_id": "tickets_greeting_toggle_system" },
                    "components": [{ "type": 10, "content": `**Sistema de Saudações**\n> Status Geral: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Mensagens Cadastradas:" },
                { "type": 10, "content": messageList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Adicionar", "emoji": { "name": "➕" }, "custom_id": "tickets_greeting_add" },
                        { "type": 2, "style": 2, "label": "Ativar/Desativar", "emoji": { "name": "🔄" }, "custom_id": "tickets_greeting_toggle_message", "disabled": messages.length === 0 },
                        { "type": 2, "style": 4, "label": "Remover", "emoji": { "name": "🗑️" }, "custom_id": "tickets_greeting_remove", "disabled": messages.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "tickets_open_premium_menu" }]
                }
            ]
        }
    ];
};