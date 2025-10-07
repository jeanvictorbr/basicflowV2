// Crie em: ui/moderacaoPremiumHub.js
module.exports = function generateModeracaoPremiumHub(settings) {
    const monitorStatus = settings.mod_monitor_enabled ? `✅ Ativado (Logs em <#${settings.mod_monitor_channel}>)` : '❌ Desativado';
    const toggleMonitorButton = settings.mod_monitor_enabled ? { label: 'Desativar Monitor', style: 4 } : { label: 'Ativar Monitor', style: 3 };

    return [
        {
            "type": 17, "accent_color": 11393254,
            "components": [
                { "type": 10, "content": "## ✨ Hub Premium de Moderação" },
                { "type": 10, "content": "> Ferramentas avançadas para otimizar e automatizar o trabalho da sua equipa." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerir Punições", "custom_id": "mod_gerir_punicoes" },
                    "components": [{ "type": 10, "content": `**Punições Personalizadas com Cargos**\n> Crie punições com cargos associados.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Ver Dashboard", "custom_id": "mod_ver_bans_temporarios" },
                    "components": [{ "type": 10, "content": `**Dashboard de Banimentos Temporários**\n> Veja e gira todos os bans com tempo definido.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": toggleMonitorButton.style, "label": toggleMonitorButton.label, "custom_id": "mod_toggle_monitor" },
                    "components": [{ "type": 10, "content": `**Monitor de Expiração de Punições**\n> Status: ${monitorStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_moderacao_menu" }] }
            ]
        }
    ];
};