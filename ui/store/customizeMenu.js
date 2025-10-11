// Crie em: ui/store/customizeMenu.js
module.exports = function generateCustomizeMenu(settings) {
    const config = settings.store_vitrine_config || {};

    const title = config.title ? `\`${config.title.substring(0, 30)}\`` : '`Padrão`';
    const description = config.description ? `\`${config.description.substring(0, 30)}...\`` : '`Padrão`';
    const color = config.color ? `\`${config.color}\`` : '`Padrão`';
    const image = config.image_url ? '`✅ Definida`' : '`❌ Nenhuma`';

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## 🎨 Personalização da Vitrine (Premium)" },
                { "type": 10, "content": "> Altere os elementos visuais da sua vitrine para combinar com a identidade do seu servidor." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Editar", "custom_id": "store_edit_vitrine_title" },
                    "components": [{ "type": 10, "content": `**Título da Vitrine**\n> Atual: ${title}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Editar", "custom_id": "store_edit_vitrine_desc" },
                    "components": [{ "type": 10, "content": `**Descrição da Vitrine**\n> Atual: ${description}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Alterar", "custom_id": "store_edit_vitrine_color" },
                    "components": [{ "type": 10, "content": `**Cor da Vitrine**\n> Atual: ${color}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Alterar", "custom_id": "store_edit_vitrine_image" },
                    "components": [{ "type": 10, "content": `**Imagem Principal da Vitrine**\n> Atual: ${image}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" }]
                }
            ]
        }
    ];
};