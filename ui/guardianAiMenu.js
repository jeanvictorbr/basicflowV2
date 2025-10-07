// ui/guardianAiMenu.js
module.exports = function generateGuardianAiMenu(settings) {
    const systemStatus = settings.guardian_ai_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.guardian_ai_enabled ? { label: 'Desativar Módulo', style: 4 } : { label: 'Ativar Módulo', style: 3 };

    const monitoredCount = settings.guardian_ai_monitored_channels ? settings.guardian_ai_monitored_channels.split(',').filter(Boolean).length : 0;
    const alertChannel = settings.guardian_ai_alert_channel ? `<#${settings.guardian_ai_alert_channel}>` : '`❌ Não definido`';
    const logChannel = settings.guardian_ai_log_channel ? `<#${settings.guardian_ai_log_channel}>` : '`❌ Não definido`';

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 🛡️ Guardian AI - Moderação Proativa" },
                { "type": 10, "content": "> Crie regras personalizadas e receba alertas sobre conflitos para proteger sua comunidade." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "custom_id": "guardian_toggle_system" },
                    "components": [{ "type": 10, "content": `**Status do Módulo**\n> Atualmente: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Gerenciar Canais", "custom_id": "guardian_manage_channels", "emoji": { "name": "📺" } },
                    "components": [{ "type": 10, "content": `**Canais Monitorados**\n> \`${monitoredCount}\` canais sendo observados.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Gerenciar Regras", "custom_id": "guardian_open_rules_menu", "emoji": { "name": "📜" } },
                    "components": [{ "type": 10, "content": `**Sistema de Regras (Ações)**\n> Defina os gatilhos e as ações da IA.` }]
                },
                 { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "guardian_set_alert_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Alertas de Conflito**\n> ${alertChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "guardian_set_log_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Logs de Ações**\n> ${logChannel}` }]
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