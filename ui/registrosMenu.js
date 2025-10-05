// ui/registrosMenu.js
module.exports = function generateRegistrosMenu(settings) {
    const canalAprovacoes = settings?.registros_canal_aprovacoes ? `<#${settings.registros_canal_aprovacoes}>` : '`❌ Não definido`';
    const cargoAprovado = settings?.registros_cargo_aprovado ? `<@&${settings.registros_cargo_aprovado}>` : '`❌ Não definido`';
    const tagAprovado = settings?.registros_tag_aprovado ? `\`✅ ${settings.registros_tag_aprovado}\`` : '`❌ Não definida`';
    const canalLogs = settings?.registros_canal_logs ? `<#${settings.registros_canal_logs}>` : '`❌ Não definido`';
    const status = settings?.registros_status === false ? { label: 'Ativar Sistema', style: 3, emoji: '✅' } : { label: 'Desativar Sistema', style: 4, emoji: '🆘' };

    return [
        {
            "type": 17, "accent_color": null, "spoiler": false,
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 4, "label": "Publicar Vitrine", "custom_id": "registros_publicar_vitrine" },
                    "components": [{ "type": 10, "content": "**Hub de Registros**" }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "registros_set_canal_aprovacoes" },
                    "components": [{ "type": 10, "content": `**Canal de Aprovações**\n> ${canalAprovacoes}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "registros_set_cargo_aprovado" },
                    "components": [{ "type": 10, "content": `**Cargo de Aprovado**\n> ${cargoAprovado}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "registros_set_tag_aprovado" },
                    "components": [{ "type": 10, "content": `**Tag de Aprovado**\n> ${tagAprovado}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 3, "label": "Alterar", "emoji": { "name": "⚙️" }, "custom_id": "registros_set_canal_logs" },
                    "components": [{ "type": 10, "content": `**Canal de Logs**\n> ${canalLogs}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" },
                        { "type": 2, "style": status.style, "label": status.label, "emoji": { "name": status.emoji }, "custom_id": "registros_toggle_status" }
                    ]
                }
            ]
        }
    ];
};