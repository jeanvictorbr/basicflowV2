// Substitua o conteúdo em: ui/devPanel/mainMenu.js
module.exports = function generateDevMainMenu(botStatus, stats, dailyTokenUsage) {
    const aiStatus = botStatus?.ai_services_enabled;
    const aiStatusButton = aiStatus
        ? { label: 'Serviços de IA: Ativados', style: 3, emoji: '✅' }
        : { label: 'Serviços de IA: Desativados', style: 4, emoji: '❌' };
    
    const activeProvider = botStatus?.active_ai_provider || 'openai';

    // --- NOVA LÓGICA DE MONITORAMENTO DE TOKENS ---
    const GROQ_DAILY_LIMIT = 500000;
    let tokenUsageText = `> **Uso de IA (Hoje):** Monitoramento indisponível.`;

    if (activeProvider === 'groq') {
        const percentage = ((dailyTokenUsage / GROQ_DAILY_LIMIT) * 100).toFixed(2);
        const progressBarLength = 20; // Aumentei o tamanho da barra para melhor visualização
        const filledBlocks = Math.round(progressBarLength * (percentage / 100));
        const emptyBlocks = progressBarLength - filledBlocks;
        const progressBar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

        tokenUsageText = `> **Tokens Groq (Hoje):** \`${dailyTokenUsage.toLocaleString('pt-BR')}\` / \`${GROQ_DAILY_LIMIT.toLocaleString('pt-BR')}\`\n` +
                         `> **Progresso:** \`[${progressBar}] ${percentage}%\``;
    } else {
        // Se for outro provedor, apenas mostra o total
        tokenUsageText = `> **Tokens ${activeProvider.toUpperCase()} (Hoje):** \`${dailyTokenUsage.toLocaleString('pt-BR')}\``;
    }
    // --- FIM DA NOVA LÓGICA ---

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 🛠️ Painel do Desenvolvedor" },
                { "type": 10, "content": `> Gerenciando **${stats.totalMembers}** membros em **${stats.totalGuilds}** servidores.` },
                // A nova informação de tokens é exibida aqui
                { "type": 10, "content": tokenUsageText },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Gerenciar Chaves", "emoji": { "name": "🔑" }, "custom_id": "dev_manage_keys" },
                        { "type": 2, "style": 1, "label": "Gerador em Massa", "emoji": { "name": "✨" }, "custom_id": "dev_open_bulk_keys" },
                        { "type": 2, "style": 1, "label": "Gerenciar Guildas", "emoji": { "name": "🏢" }, "custom_id": "dev_manage_guilds" },
                        { "type": 2, "style": 3, "label": "Enviar Atualização", "emoji": "📣", "custom_id": "dev_send_update" }, 
                        { "type": 2, "style": 2,  "label": "Ver Assinantes", "emoji": "📊", "custom_id": "dev_view_update_subscribers" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Analytics", "emoji": { "name": "📊" }, "custom_id": "dev_open_analytics" },
                        { "type": 2, "style": 1, "label": "Feature Flags", "emoji": { "name": "🚩" }, "custom_id": "dev_open_feature_flags" },
                        { "type": 2, "style": 1, "label": "Provedor de IA", "emoji": { "name": "🤖" }, "custom_id": "dev_open_ai_provider_menu" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": aiStatusButton.style, "label": aiStatusButton.label, "emoji": { "name": aiStatusButton.emoji }, "custom_id": "dev_toggle_ai" },
                        { "type": 2, "style": 2, "label": "Definir Mensagem", "emoji": { "name": "📝" }, "custom_id": "dev_set_maintenance_message" }
                    ]
                }
            ]
        }
    ];
};