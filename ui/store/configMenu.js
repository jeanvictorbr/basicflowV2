// Crie em: ui/store/configMenu.js
module.exports = function generateConfigMenu(settings) {
    const category = settings.store_category_id ? `<#${settings.store_category_id}>` : '`❌ Não definida`';
    const vitrineChannel = settings.store_vitrine_channel_id ? `<#${settings.store_vitrine_channel_id}>` : '`❌ Não definido`';
    const logChannel = settings.store_log_channel_id ? `<#${settings.store_log_channel_id}>` : '`❌ Não definido`';
    const staffRole = settings.store_staff_role_id ? `<@&${settings.store_staff_role_id}>` : '`❌ Não definido`';
    const clientRole = settings.store_client_role_id ? `<@&${settings.store_client_role_id}>` : '`❌ Não definido`';
    const pixKey = settings.store_pix_key ? '`✅ Definida`' : '`❌ Não definida`';
    const isConfigured = category !== '`❌ Não definida`' && logChannel !== '`❌ Não definida`' && staffRole !== '`❌ Não definido`';

    return [
        {
            "type": 17, "accent_color": 15105570,
            "components": [
                { "type": 10, "content": "## ⚙️ Configurações Essenciais da Loja" },
                { "type": 10, "content": "> Defina os canais e cargos necessários para o funcionamento do StoreFlow." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir", "custom_id": "store_set_category" },
                    "components": [{ "type": 10, "content": `**Categoria dos Carrinhos**\n> ${category}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir", "custom_id": "store_set_vitrine_channel" },
                    "components": [{ "type": 10, "content": `**Canal da Vitrine**\n> ${vitrineChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir", "custom_id": "store_set_log_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Logs**\n> ${logChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir", "custom_id": "store_set_staff_role" },
                    "components": [{ "type": 10, "content": `**Cargo Staff da Loja**\n> ${staffRole}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir", "custom_id": "store_set_client_role" },
                    "components": [{ "type": 10, "content": `**Cargo de Cliente (Pós-Compra)**\n> ${clientRole}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 2, "label": "Definir", "custom_id": "store_set_pix_key" },
                    "components": [{ "type": 10, "content": `**Chave PIX (Pag. Manual)**\n> ${pixKey}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                 {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Publicar Vitrine", "emoji": { "name": "📢" }, "custom_id": "store_publish_vitrine", "disabled": !isConfigured },
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_store_menu" },
                        { "type": 2, "style": 2, "label": "Avançado", "emoji": { "name": "➡️" }, "custom_id": "store_config_advanced" }
                    ]
                }
            ]
        }
    ];
};