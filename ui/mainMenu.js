// Este arquivo exporta o design COMPLETO do menu principal.
module.exports = [
    {
        "type": 17,
        "accent_color": 16711684,
        "spoiler": false,
        "components": [
            { "type": 10, "content": "⚙️**Hub de configurações**⚙️" },
            { "type": 14, "divider": true, "spacing": 2 },
            {
                "type": 9,
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "open_ausencias_menu" },
                "components": [
                    { "type": 10, "content": "🏖️ Ausências " },
                    { "type": 10, "content": "Configure todo o sistema de **ausências** dentro deste módulo completo." }
                ]
            },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9,
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "open_registros_menu" },
                "components": [
                    { "type": 10, "content": "📂 Registros" },
                    { "type": 10, "content": "Configure todo o sistema de **registros** dentro deste módulo completo." }
                ]
            },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9,
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "open_tickets_menu" },
                "components": [ { "type": 10, "content": "🚨 Tickets" } ]
            },
            { "type": 10, "content": "Configure todo o sistema de **tickets** dentro deste módulo completo." },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9,
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "open_uniformes_menu" },
                "components": [ { "type": 10, "content": "👔 Uniformes" } ]
            },
            { "type": 10, "content": "Configure todo o sistema de **uniformes** dentro deste módulo completo." },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9,
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "open_ponto_menu" },
                "components": [
                    { "type": 10, "content": "⏰ Bate-Ponto" },
                    { "type": 10, "content": "Configure todo o sistema de **bate-ponto** dentro deste módulo completo." }
                ]
            },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 1,
                "components": [
                    { "type": 2, "style": 2, "label": "Novidades bot", "emoji": { "name": "🎉" }, "disabled": false, "custom_id": "main_novidades" },
                    { "type": 2, "style": 4, "label": "Ativar key", "emoji": null, "disabled": false, "custom_id": "main_ativar_key" },
                    { "type": 2, "style": 2, "label": "🥇Link discord", "emoji": null, "disabled": false, "custom_id": "main_link_discord" }
                ]
            }
        ]
    }
];