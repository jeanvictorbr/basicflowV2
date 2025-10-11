// Substitua o conteúdo em: ui/suggestionsMenu.js
module.exports = function generateSuggestionsMenu(settings) {
    const systemStatus = settings.suggestions_enabled ? '✅ Ativado' : '❌ Desativado';
    const toggleButton = settings.suggestions_enabled ? { label: 'Desativar Sistema', style: 4 } : { label: 'Ativar Sistema', style: 3 };

    const everyoneMentionStatus = settings.suggestions_mention_everyone ? '✅ Ativado' : '❌ Desativado';
    const toggleEveryoneButton = settings.suggestions_mention_everyone ? { label: 'Desativar Menção', style: 4 } : { label: 'Ativar Menção', style: 3 };

    const channel = settings.suggestions_channel ? `<#${settings.suggestions_channel}>` : '`❌ Não definido`';
    const logChannel = settings.suggestions_log_channel ? `<#${settings.suggestions_log_channel}>` : '`❌ Não definido`';
    const staffRole = settings.suggestions_staff_role ? `<@&${settings.suggestions_staff_role}>` : '`❌ Não definido`';
    
    // Novo texto para o cooldown
    const cooldownMinutes = settings.suggestions_cooldown_minutes ?? 2;
    const cooldownText = cooldownMinutes > 0 ? `\`${cooldownMinutes} minuto(s)\`` : '`Desativado`';

    const isConfigured = settings.suggestions_channel && settings.suggestions_log_channel && settings.suggestions_staff_role;

    return [
        {
            "type": 17,
            "accent_color": 16705372,
            "components": [
                { "type": 10, "content": "## 💡 Hub de Sugestões" },
                { "type": 10, "content": "> Configure o sistema de sugestões da sua comunidade." },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleButton.style, "label": toggleButton.label, "custom_id": "suggestions_toggle_system" },
                    "components": [{ "type": 10, "content": `**Status do Sistema:** ${systemStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": toggleEveryoneButton.style, "label": toggleEveryoneButton.label, "custom_id": "suggestions_toggle_everyone" },
                    "components": [{ "type": 10, "content": `**Mencionar @everyone:** ${everyoneMentionStatus}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "suggestions_set_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Sugestões:**\n> ${channel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Definir Canal", "custom_id": "suggestions_set_log_channel" },
                    "components": [{ "type": 10, "content": `**Canal de Logs:**\n> ${logChannel}` }]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Definir Cargo", "custom_id": "suggestions_set_staff_role" },
                    "components": [{ "type": 10, "content": `**Cargo de Gerenciamento:**\n> ${staffRole}` }]
                },
                // --- NOVA SEÇÃO DE COOLDOWN ---
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 9,
                    "accessory": { "type": 2, "style": 2, "label": "Definir Cooldown", "custom_id": "suggestions_set_cooldown" },
                    "components": [{ "type": 10, "content": `**Cooldown de Uso:**\n> ${cooldownText}` }]
                },
                // --- FIM DA SEÇÃO ---
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 1, "label": "Publicar Vitrine", "custom_id": "suggestions_publish_vitrine", "disabled": !isConfigured, "emoji": { "name": "📢" } }
                    ]
                },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }]
                }
            ]
        }
    ];
};