// Substitua o conteúdo em: ui/guildArchitect/mainMenu.js
module.exports = function generateArchitectMenu() {
    return [
        {
            "type": 17,
            "accent_color": 16776960, // Amarelo
            "components": [
                { "type": 10, "content": "## 🏗️ Arquiteto de Servidor com IA" },
                { "type": 10, "content": "> Bem-vindo! Eu posso construir um servidor do zero ou analisar sua estrutura atual para sugerir melhorias e novas funcionalidades. O que você deseja fazer?" },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        // BOTÃO EXISTENTE
                        { "type": 2, "style": 3, "label": "Construir Novo Servidor", "emoji": { "name": "✨" }, "custom_id": "architect_start_new" },
                        // NOVO BOTÃO DE ANÁLISE
                        { "type": 2, "style": 1, "label": "Analisar Servidor Atual", "emoji": { "name": "🔍" }, "custom_id": "architect_analyze_server" }
                    ]
                },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 2, "label": "Cancelar", "emoji": { "name": "✖️" }, "custom_id": "delete_ephemeral_reply" }
                    ]
                }
            ]
        }
    ];
};