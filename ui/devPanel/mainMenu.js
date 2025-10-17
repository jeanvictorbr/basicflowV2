// ui/devPanel/mainMenu.js

module.exports = function generateDevMainMenu(botStatus, stats, dailyTokenUsage) {
    // ---- Status dos Toggles ----
    const botOn = botStatus?.bot_enabled;
    const botOnButton = botOn
        ? { label: 'Bot: Ativado', style: 3, emoji: '✅' }
        : { label: 'Bot: Desativado', style: 4, emoji: '❌' };
    
    const aiOn = botStatus?.ai_services_enabled;
    const aiOnButton = aiOn
        ? { label: 'IA: Ativada', style: 3, emoji: '✅' }
        : { label: 'IA: Desativada', style: 4, emoji: '❌' };
    
    const activeProvider = botStatus?.active_ai_provider || 'openai';

    // ---- Monitoramento de Tokens ----
    const GROQ_DAILY_LIMIT = 500000;
    const usage = dailyTokenUsage || 0;
    let tokenUsageText = `> **Tokens ${activeProvider.toUpperCase()} (Hoje):** \`${usage.toLocaleString('pt-BR')}\``;

    if (activeProvider === 'groq') {
        const percentage = ((usage / GROQ_DAILY_LIMIT) * 100).toFixed(2);
        const progressBarLength = 20;
        const filledBlocks = Math.round(progressBarLength * (percentage / 100));
        const emptyBlocks = progressBarLength - filledBlocks;
        const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

        tokenUsageText = `> **Tokens Groq (Hoje):** \`${usage.toLocaleString('pt-BR')}\` / \`${GROQ_DAILY_LIMIT.toLocaleString('pt-BR')}\`\n` +
                         `> **Progresso:** \`[${progressBar}] ${percentage}%\``;
    }

    // ---- Construção da UI ----
    return [
        {
            "type": 17, 
            "accent_color": 15844367,
            "thumbnail": {
                "url": "https://i.imgur.com/6nY45Wx.png"
            },
            "components": [
                { "type": 10, "content": "## 🛠️ Painel do Desenvolvedor" },
                { "type": 10, "content": `> Gerenciando **${stats.totalMembers}** membros em **${stats.totalGuilds}** servidores.` },
                { "type": 10, "content": tokenUsageText },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 10, "content": "### Gestão Principal" },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Gerenciar Guildas", "emoji": { "name": "🏢" }, "custom_id": "dev_manage_guilds" },
                        { "type": 2, "style": 1, "label": "Gerenciar Chaves", "emoji": { "name": "🔑" }, "custom_id": "dev_manage_keys" },
                        { "type": 2, "style": 1, "label": "Analytics", "emoji": { "name": "📈" }, "custom_id": "dev_open_analytics" },
                        { "type": 2, "style": 3, "label": "Enviar Atualização", "emoji": { "name": "📣" }, "custom_id": "dev_send_update" },
                        { "type": 2, "style": 2, "label": "Ver Assinantes", "emoji": { "name": "👥" }, "custom_id": "dev_view_update_subscribers" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Monitoramento e Depuração" },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Saúde do Sistema", "emoji": { "name": "🩺" }, "custom_id": "dev_open_health_check" },
                        { "type": 2, "style": 2, "label": "Monitor de IA", "emoji": { "name": "🧠" }, "custom_id": "dev_open_ai_monitor" },
                        { "type": 2, "style": 2, "label": "Feature Flags", "emoji": { "name": "🚩" }, "custom_id": "dev_open_feature_flags" },
                        { "type": 2, "style": 2, "label": "Provedor de IA", "emoji": { "name": "🤖" }, "custom_id": "dev_open_ai_provider_menu" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Controles Globais" },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": botOnButton.style, "label": botOnButton.label, "emoji": { "name": botOnButton.emoji }, "custom_id": "dev_toggle_bot_status" },
                        { "type": 2, "style": aiOnButton.style, "label": aiOnButton.label, "emoji": { "name": aiOnButton.emoji }, "custom_id": "dev_toggle_ai" },
                        // --- BOTÕES DE MENSAGEM AJUSTADOS ---
                        { "type": 2, "style": 2, "label": "Mensagem Global", "emoji": { "name": "📝" }, "custom_id": "dev_set_maintenance_message_global" },
                        { "type": 2, "style": 2, "label": "Mensagem IA", "emoji": { "name": "🤖" }, "custom_id": "dev_set_maintenance_message" }
                    ]
                }
            ]
        }
    ];
};