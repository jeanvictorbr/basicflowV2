// ui/ticketsPremiumMenu.js
module.exports = function generateTicketsPremiumMenu(settings = {}) { // Adicionado um valor padrão
    const departmentsStatus = settings.tickets_use_departments ? '✅ Ativado' : '❌ Desativado';
    const greetingStatus = settings.tickets_greeting_enabled ? '✅ Ativado' : '❌ Desativado';
    const feedbackStatus = settings.tickets_feedback_enabled ? '✅ Ativado' : '❌ Desativado';
    const autoCloseStatus = settings.tickets_autoclose_enabled ? `✅ Ativado (${settings.tickets_autoclose_hours || 48}h)` : '❌ Desativado';
    const aiStatus = settings.tickets_ai_assistant_enabled ? '✅ Ativado' : '❌ Desativado';

    // Lógica para o fluxo de DM
    const dmFlowStatus = settings.tickets_dm_flow_enabled ? '✅ Ativado (Via DM)' : '❌ Desativado (Padrão via Canal)';
    const toggleDmFlowButton = settings.tickets_dm_flow_enabled 
        ? { label: 'Usar Canais', style: 4 } // Vermelho
        : { label: 'Usar DMs', style: 3 }; // Verde
        
    const claimChannel = settings.tickets_dm_claim_channel_id ? `<#${settings.tickets_dm_claim_channel_id}>` : '`❌ Não definido`';

    return [
        {
            "type": 17, "accent_color": 5752042,
            "components": [
                { "type": 10, "content": "## ✨ Hub Premium de Tickets" },
                { "type": 14, "divider": true, "spacing": 1 },
                // --- SEÇÃO DE FLUXO DE ATENDIMENTO ---
                {
                    "type": 9, 
                    "accessory": { "type": 2, "style": toggleDmFlowButton.style, "label": toggleDmFlowButton.label, "custom_id": "tickets_toggle_dm_flow", disabled: "true"},
                    "components": [{ "type": 10, "content": `**Fluxo de Atendimento**\n> Status: \`${dmFlowStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                // --- BOTÃO PARA DEFINIR O CANAL ---
                {
                    "type": 9, 
                    "accessory": { 
                        "type": 2, 
                        "style": 1, 
                        "label": "Definir Canal", 
                        "custom_id": "tickets_set_dm_claim_channel", 
                        "disabled": !settings.tickets_dm_flow_enabled // Desabilitado se o fluxo de DM estiver inativo
                    },
                    "components": [{ "type": 10, "content": `**Canal para Assumir Atendimentos (DM)**\n> ${claimChannel}` }]
                },
                // --- FIM DA SEÇÃO NOVA ---
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar", "custom_id": "tickets_config_departments" },
                    "components": [{ "type": 10, "content": `**Departamentos de Suporte**\n> Status: \`${departmentsStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "tickets_config_greeting" },
                    "components": [{ "type": 10, "content": `**Mensagem de Saudação**\n> Status: \`${greetingStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "tickets_config_autoclose" },
                    "components": [{ "type": 10, "content": `**Auto-Fechamento de Tickets**\n> Status: \`${autoCloseStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Ver Painel", "custom_id": "tickets_view_feedback" },
                    "components": [{ "type": 10, "content": `**Avaliações de Atendimento**\n> Status: \`${feedbackStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "tickets_config_ai" },
                    "components": [{ "type": 10, "content": `**Assistente com IA**\n> Status: \`${aiStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_tickets_menu" }]
                }
            ]
        }
    ];
};