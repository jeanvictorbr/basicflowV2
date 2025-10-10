// Substitua o conteúdo em: ui/devPanel/mainMenu.js
module.exports = function generateDevMainMenu(botStatus, stats) {
    const aiStatus = botStatus?.ai_services_enabled;
    const aiStatusButton = aiStatus
        ? { label: 'Serviços de IA: Ativados', style: 3, emoji: '✅' } // Verde
        : { label: 'Serviços de IA: Desativados', style: 4, emoji: '❌' }; // Vermelho

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 🛠️ Painel do Desenvolvedor" },
                { "type": 10, "content": `> Gerenciando **${stats.totalMembers}** membros em **${stats.totalGuilds}** servidores.` },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Gerenciar Chaves", "emoji": { "name": "🔑" }, "custom_id": "dev_manage_keys" },
                        { "type": 2, "style": 1, "label": "Gerenciar Guildas", "emoji": { "name": "🏢" }, "custom_id": "dev_manage_guilds" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": aiStatusButton.style, "label": aiStatusButton.label, "emoji": { "name": aiStatusButton.emoji }, "custom_id": "dev_toggle_ai" }
                    ]
                }
            ]
        }
    ];
};