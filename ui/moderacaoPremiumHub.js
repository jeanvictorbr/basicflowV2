// Substitua o conteúdo em: ui/moderacaoPremiumHub.js
module.exports = function generateModeracaoPremiumHub(settings) {
    const monitorLogChannel = settings.mod_monitor_channel ? `<#${settings.mod_monitor_channel}>` : '`Não definido`';
    const monitorStatus = settings.mod_monitor_enabled ? `✅ Ativado (Logs em ${monitorLogChannel})` : '❌ Desativado';
    const toggleMonitorButton = settings.mod_monitor_enabled ? { label: 'Desativar Monitor', style: 4 } : { label: 'Ativar Monitor', style: 3 };

    return [
        {
            "type": 17, "accent_color": 11393254,
            "components": [
                { "type": 10, "content": "## ✨ Hub Premium de Moderação" },
                { "type": 10, "content": "> Ferramentas avançadas para otimizar e automatizar o trabalho da sua equipa." },
                { "type": 14, "divider": true, "spacing": 1 },
                // ================== NOVA FILEIRA DE BOTÕES ==================
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Dossiê de Membros", "custom_id": "mod_dossie_manage",disabled: "true", "emoji": { "name": "📁" } },
                        { "type": 2, "style": 1, "label": "Auditoria da Equipe", "custom_id": "mod_open_audit_panel", "emoji": { "name": "📊" } }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                // ==========================================================
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerir Punições", "custom_id": "mod_gerir_punicoes" },
                    "components": [{ "type": 10, "content": `**Punições Personalizadas com Cargos**\n> Crie punições com cargos associados.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Ver Dashboard", "custom_id": "mod_ver_bans_temporarios" },
                    "components": [{ "type": 10, "content": `**Dashboard de Banimentos**\n> Veja e gira todos os bans do servidor.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Ver Lista", "custom_id": "mod_ver_punicoes_ativas", "emoji": { "name": "⏳" } },
                    "components": [{ "type": 10, "content": `**Punições Ativas**\n> Veja e revogue timeouts e bans temporários.` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": toggleMonitorButton.style, "label": toggleMonitorButton.label, "custom_id": "mod_toggle_monitor" },
                    "components": [{ "type": 10, "content": `**Monitor de Expiração de Punições**\n> Status: ${monitorStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9, "accessory": { "type": 2, "style": 1, "label": "Definir Canal", "custom_id": "mod_set_monitor_channel", "disabled": !settings.mod_monitor_enabled },
                    "components": [{ "type": 10, "content": "**Canal de Logs do Monitor**\n> Onde as notificações de expiração serão enviadas." }]
                },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_moderacao_menu" }] }
            ]
        }
    ];
};