// Crie em: ui/guardianAlertsHubMenu.js
module.exports = function generateGuardianAlertsHubMenu(settings) {
    const systemStatus = settings.guardian_ai_alert_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.guardian_ai_alert_enabled ? { label: 'Desativar Alertas', style: 4 } : { label: 'Ativar Alertas', style: 3 };
    const alertChannel = settings.guardian_ai_alert_channel ? `<#${settings.guardian_ai_alert_channel}>` : '`❌ Não definido`';
    const cooldown = `\`${settings.guardian_ai_alert_cooldown_minutes || 5}\` minutos`;
    const toxicity = `\`${settings.guardian_ai_alert_toxicity_threshold || 75}%\``;
    const sarcasm = `\`${settings.guardian_ai_alert_sarcasm_threshold || 80}%\``;
    const attack = `\`${settings.guardian_ai_alert_attack_threshold || 80}%\``;

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 🚨 Hub de Alertas de Conflito" },
                { "type": 10, "content": "> Configure o sistema de alertas passivos da IA." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "custom_id": "guardian_alert_toggle_system" },
                    "components": [{ "type": 10, "content": `**Status do Sistema de Alertas**\n> Atualmente: ${systemStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "guardian_alert_set_channel" },
                    "components": [{ "type": 10, "content": `**Canal para Envio dos Alertas**\n> ${alertChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Alterar", "custom_id": "guardian_alert_set_cooldown" },
                    "components": [{ "type": 10, "content": `**Cooldown entre Alertas**\n> ${cooldown}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Ajustar", "custom_id": "guardian_alert_set_thresholds" },
                    "components": [{ "type": 10, "content": `**Limiares de Sensibilidade**\n> Tox.: ${toxicity} | Sarc.: ${sarcasm} | Atq.: ${attack}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_guardian_menu" }] }
            ]
        }
    ];
};