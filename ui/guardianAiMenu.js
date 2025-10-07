// Crie em: ui/guardianAiMenu.js
module.exports = function generateGuardianAiMenu(settings) {
    const systemStatus = settings.guardian_ai_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.guardian_ai_enabled ? { label: 'Desativar Módulo', style: 4 } : { label: 'Ativar Módulo', style: 3 };

    const alertChannel = settings.guardian_ai_alert_channel ? `<#${settings.guardian_ai_alert_channel}>` : '`❌ Não definido`';
    const monitoredCount = settings.guardian_ai_monitored_channels?.split(',').length || 0;

    return [
        {
            "type": 17,
            "accent_color": 15105570, // Cor vermelha
            "components": [
                { "type": 10, "content": "## 🛡️ Guardian AI - Moderação Proativa" },
                { "type": 10, "content": "> Monitore conversas e previna conflitos antes que eles aconteçam com o poder da IA." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "custom_id": "guardian_toggle_system" },
                    "components": [{ "type": 10, "content": `**Status do Módulo**\n> Atualmente: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "guardian_set_alert_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Alertas da Staff**\n> ${alertChannel}` }]
                },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Gerenciar Canais", "custom_id": "guardian_manage_channels" },
                    "components": [{ "type": 10, "content": `**Canais Monitorados**\n> \`${monitoredCount}\` canais sendo observados.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Ajustar", "custom_id": "guardian_config_sensitivity" },
                    "components": [{ "type": 10, "content": `**Nível de Sensibilidade**\n> Usando o preset: \`${settings.guardian_ai_sensitivity || 'Balanceado'}\`` }]
                },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "guardian_config_actions" },
                    "components": [{ "type": 10, "content": `**Ações e Intervenções**\n> Configure as respostas do bot.` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                }
            ]
        }
    ];
};