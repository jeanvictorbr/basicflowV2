// ui/ticketsMenu.js
module.exports = function generateTicketsMenu(settings, isPremium)  {
    const categoria = settings?.tickets_category ? `<#${settings.tickets_category}>` : '`❌ Não definida`';
    const thumbnail = settings?.tickets_thumbnail_url ? '`✅ Definida`' : '`❌ Não definida`';
    const canalLogs = settings?.tickets_canal_logs ? `<#${settings.tickets_canal_logs}>` : '`❌ Não definido`';
    const cargoSuporte = settings?.tickets_cargo_suporte ? `<@&${settings.tickets_cargo_suporte}>` : '`❌ Não definido`';

    return [
        {
            "type": 17, "accent_color": null, "spoiler": false,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 4, "label": "Publicar Painel", "custom_id": "tickets_publicar_painel" },
                    "components": [{ "type": 10, "content": "# Hub de Tickets" }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "tickets_set_category" },
                    "components": [{ "type": 10, "content": `**Categoria dos Tickets**\n> ${categoria}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "tickets_set_thumbnail", "disabled": !isPremium  },
                    "components": [{ "type": 10, "content": `**Thumbnail do Ticket**\n> ${thumbnail}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "tickets_set_canal_logs" },
                    "components": [{ "type": 10, "content": `**Canal de Logs**\n> ${canalLogs}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "tickets_set_cargo_suporte" },
                    "components": [{ "type": 10, "content": `**Cargo de Suporte**\n> ${cargoSuporte}` }]
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