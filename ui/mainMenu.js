// Este arquivo exporta o design do menu principal para ser reutilizado.
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
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "91e0639b02934906d94100b10afbfaa8" },
                "components": [
                    { "type": 10, "content": "🏖️ Ausências " },
                    { "type": 10, "content": "Configure todo o sistema de **ausências** dentro deste módulo completo." }
                ]
            },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 9,
                "accessory": { "type": 2, "style": 3, "label": "Abrir", "emoji": { "name": "📥" }, "disabled": false, "custom_id": "76b54bbaec134998bff58d3aa2eefafd" },
                "components": [
                    { "type": 10, "content": "📂 Registros" },
                    { "type": 10, "content": "Configure todo o sistema de **registros** dentro deste módulo completo." }
                ]
            },
            // ... adicione as outras seções (Tickets, Uniformes, Bate-Ponto) aqui se quiser ...
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 1,
                "components": [
                    { "type": 2, "style": 2, "label": "Novidades bot", "emoji": { "name": "🎉" }, "disabled": false, "custom_id": "c9cdc4dc42484645e4952ae618c00eae" },
                    { "type": 2, "style": 4, "label": "Ativar key", "emoji": null, "disabled": false, "custom_id": "6a6167838bde470ac24446d015ed1f60" },
                    { "type": 2, "style": 2, "label": "🥇Link discord", "emoji": null, "disabled": false, "custom_id": "eb5a88847a1246d8a13d034c9991c39d" }
                ]
            }
        ]
    }
];