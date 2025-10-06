// ui/pontoPainel.js
module.exports = function generatePontoPainel(settings) {
    const imageUrl = settings.ponto_imagem_vitrine || "https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless";

    return [
        {
            "type": 17, "accent_color": null, "spoiler": false,
            "components": [
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Ranking Ponto", "emoji": { "name": "🥇" }, "custom_id": "ponto_show_ranking" },
                    "components": [
                        { "type": 10, "content": "# Sistema de Bate-Ponto" },
                        { "type": 10, "content": "Clique em iniciar serviço para receber o seu dashboard de serviço.\nTambém veja o Ranking completo de horas clicando no botao \"Ranking Ponto\"." }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 12, "items": [{ "media": { "url": imageUrl } }] },
                { "type": 1, "components": [{ "type": 2, "style": 3, "label": "Iniciar Serviço", "emoji": { "name": "▶️" }, "custom_id": "ponto_start_service" }] }
            ]
        }
    ];
};