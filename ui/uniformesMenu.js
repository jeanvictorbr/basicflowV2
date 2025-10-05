// ui/uniformesMenu.js
module.exports = function generateUniformesMenu(settings) {
    const thumbnail = settings?.uniformes_thumbnail_url ? '`✅ Definida`' : '`❌ Não definida`';
    const color = settings?.uniformes_color ? `\`${settings.uniformes_color}\`` : '`🎨 Padrão (#FFFFFF)`';

    return [
        {
            "type": 17, "accent_color": null, "spoiler": false,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 4, "label": "Publicar Vitrine", "custom_id": "uniformes_publicar_vitrine" },
                    "components": [{ "type": 10, "content": "# Hub de Uniformes" }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "Adicione, edite ou remova os uniformes da sua organização." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Adicionar", "emoji": { "name": "➕" }, "custom_id": "uniformes_add" },
                        { "type": 2, "style": 1, "label": "Editar", "emoji": { "name": "✏️" }, "custom_id": "uniformes_edit" },
                        { "type": 2, "style": 4, "label": "Remover", "emoji": { "name": "🗑️" }, "custom_id": "uniformes_remove" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "uniformes_set_thumbnail" },
                    "components": [{ "type": 10, "content": `**Thumbnail da Vitrine**\n> ${thumbnail}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "uniformes_set_color" },
                    "components": [{ "type": 10, "content": `**Cor da Vitrine (Hex)**\n> ${color}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                }
            ]
        }
    ];
};