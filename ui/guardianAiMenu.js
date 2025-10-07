// Substitua em: ui/guardianAiMenu.js
module.exports = function generateGuardianAiMenu(settings) {
    const systemStatus = settings.guardian_ai_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.guardian_ai_enabled ? { label: 'Desativar Módulo', style: 4 } : { label: 'Ativar Módulo', style: 3 };
    const monitoredCount = settings.guardian_ai_monitored_channels ? settings.guardian_ai_monitored_channels.split(',').filter(Boolean).length : 0;
    const logChannel = settings.guardian_ai_log_channel ? `<#${settings.guardian_ai_log_channel}>` : '`❌ Não definido`';
    const alertsStatus = settings.guardian_ai_alert_enabled ? '`✅ Ativado`' : '`❌ Desativado`';
    
    // Lógica para o novo botão de integração
    const integrationStatus = settings.guardian_use_mod_punishments ? '`✅ Ativada`' : '`❌ Desativada`';
    const toggleIntegrationButton = settings.guardian_use_mod_punishments ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 🛡️ Guardian AI - Moderação Proativa" },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "custom_id": "guardian_toggle_system" },
                    "components": [{ "type": 10, "content": `**Status do Módulo**\n> Atualmente: \`${systemStatus}\`` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 1, "label": "Gerenciar", "custom_id": "guardian_manage_channels", "emoji": { "name": "📺" } },
                    "components": [{ "type": 10, "content": `**Canais Monitorados**\n> \`${monitoredCount}\` canais sendo observados.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar", "custom_id": "guardian_open_rules_menu", "emoji": { "name": "📜" } },
                    "components": [{ "type": 10, "content": `**Sistema de Regras (Ações)**\n> Defina os gatilhos e as ações punitivas da IA.` }]
                },
                 { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Configurar", "custom_id": "guardian_open_alerts_hub" },
                    "components": [{ "type": 10, "content": `**Hub de Alertas de Conflito**\n> Status: ${alertsStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "guardian_set_log_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Logs de Ações**\n> ${logChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                // --- NOVA OPÇÃO DE INTEGRAÇÃO ---
                {
                    "type": 9, "accessory": { "type": 2, "style": toggleIntegrationButton.style, "label": toggleIntegrationButton.label, "custom_id": "guardian_toggle_mod_integration" },
                    "components": [{ "type": 10, "content": `**Integração com Mód. de Moderação**\n> Usar punições personalizadas: ${integrationStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }] }
            ]
        }
    ];
};