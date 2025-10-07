// ui/guardianChannelsMenu.js
module.exports = function generateGuardianChannelsMenu(settings) {
    const monitoredCount = settings.guardian_ai_monitored_channels ? settings.guardian_ai_monitored_channels.split(',').filter(Boolean).length : 0;
    const ignoredCount = settings.guardian_ai_ignored_channels ? settings.guardian_ai_ignored_channels.split(',').filter(Boolean).length : 0;

    return [
        {
            "type": 17,
            "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 🛡️ Canais do Guardian AI" },
                { "type": 10, "content": "> Escolha quais canais a IA deve observar ativamente e quais ela deve ignorar." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Selecionar", "custom_id": "guardian_channels_set_monitored" },
                    "components": [{ "type": 10, "content": `**Canais Monitorados**\n> \`${monitoredCount}\` canais selecionados.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 1, "label": "Selecionar", "custom_id": "guardian_channels_set_ignored" },
                    "components": [{ "type": 10, "content": `**Canais Ignorados**\n> \`${ignoredCount}\` canais selecionados.` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_guardian_menu" }]
                }
            ]
        }
    ];
}