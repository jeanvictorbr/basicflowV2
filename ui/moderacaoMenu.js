// ui/moderacaoMenu.js
module.exports = function generateModeracaoMenu(settings, isPremium) {
    const logChannel = settings?.mod_log_channel ? `<#${settings.mod_log_channel}>` : '`❌ Não definido`';
    const modRolesCount = settings?.mod_roles ? settings.mod_roles.split(',').filter(Boolean).length : 0;
    const tempBanStatus = settings?.mod_temp_ban_enabled ? '`✅ Ativado`' : '`❌ Desativado`';
    const toggleTempBanButton = settings?.mod_temp_ban_enabled ? { label: 'Desativar', style: 4 } : { label: 'Ativar', style: 3 };

    return [
        {
            "type": 17, "accent_color": 15158332,
            "components": [
                // --- BOTÃO DE ACESSO AO HUB OPERACIONAL ADICIONADO AQUI ---
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Aceder", "emoji": { "name": "➡️" }, "custom_id": "mod_open_hub" },
                    "components": [{ "type": 10, "content": "## ⚖️ Central de Moderação" }, { "type": 10, "content": "> Aceda ao painel para procurar membros e aplicar punições." }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Configurações do Módulo" },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "mod_set_log_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Logs de Moderação**\n> ${logChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerir Cargos", "custom_id": "mod_set_roles" },
                    "components": [{ "type": 10, "content": `**Cargos com Permissão**\n> \`${modRolesCount}\` cargos definidos.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": toggleTempBanButton.style, "label": toggleTempBanButton.label, "custom_id": "mod_toggle_tempban", "disabled": !isPremium },
                    "components": [{ "type": 10, "content": `**Banimentos Temporários (Premium)**\n> Status: ${tempBanStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                }
            ]
        }
    ];
};