// ui/devPanel/mainMenu.js
module.exports = function generateDevMainMenu() {
    return [
        {
            "type": 17, "accent_color": 15844367, // Laranja
            "components": [
                { "type": 10, "content": "## 🛠️ Painel do Desenvolvedor" },
                { "type": 10, "content": "> Ferramentas para gerenciamento de licenças e guildas." },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 1, "label": "Gerenciar Chaves", "emoji": { "name": "🔑" }, "custom_id": "dev_manage_keys" },
                        { "type": 2, "style": 1, "label": "Gerenciar Guildas", "emoji": { "name": "🏢" }, "custom_id": "dev_manage_guilds" }
                    ]
                }
            ]
        }
    ];
};