// ui/ticketsPremiumMenu.js
module.exports = function generateTicketsPremiumMenu(settings) {
    const departmentsStatus = settings.tickets_use_departments ? '✅ Ativado' : '❌ Desativado';
    const greetingStatus = settings.tickets_greeting_enabled ? '✅ Ativado' : '❌ Desativado';
    const feedbackStatus = settings.tickets_feedback_enabled ? '✅ Ativado' : '❌ Desativado';
    const autoCloseStatus = settings.tickets_autoclose_enabled ? `✅ Ativado (${settings.tickets_autoclose_hours || 48}h)` : '❌ Desativado';

    return [
        {
            "type": 17, "accent_color": 5752042,
            "components": [
                { "type": 10, "content": "## ✨ Hub Premium de Tickets" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Gerenciar", "custom_id": "tickets_config_departments" },
                    "components": [{ "type": 10, "content": `**Departamentos de Suporte**\n> Status: \`${departmentsStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "tickets_config_greeting" },
                    "components": [{ "type": 10, "content": `**Mensagem de Saudação**\n> Status: \`${greetingStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "tickets_config_autoclose" },
                    "components": [{ "type": 10, "content": `**Auto-Fechamento de Tickets**\n> Status: \`${autoCloseStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    // BOTÃO CORRIGIDO PARA "VER PAINEL"
                    "accessory": { "type": 2, "style": 1, "label": "Ver Painel", "custom_id": "tickets_view_feedback" },
                    "components": [{ "type": 10, "content": `**Avaliações de Atendimento**\n> Status: \`${feedbackStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Em Breve", "disabled": true, "custom_id": "tickets_config_ai" },
                    "components": [{ "type": 10, "content": `**Assistente com IA**\n> Status: \`Em desenvolvimento\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_tickets_menu" }]
                }
            ]
        }
    ];
};