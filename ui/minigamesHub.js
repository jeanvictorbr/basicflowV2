// Crie este arquivo em: ui/minigamesHub.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = function generateMinigamesHub() {
    return {
        components: [
            {
                type: 17,
                accent_color: 15105570, // Orange
                components: [
                    { type: 10, content: "## 🎲 Hub de Mini-Games" },
                    { type: 10, content: "> Gerencie, configure e inicie os jogos disponíveis no seu servidor." },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 10, content: "### 💀 Jogo da Forca" },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 2, label: "Ver Ranking", emoji: { name: "🏆" }, custom_id: "hangman_show_ranking" },
                        ]
                    },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 10, content: "### 🛑 Jogo Stop!" },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 1, label: "Gerenciar Categorias", emoji: { name: "⚙️" }, custom_id: "stop_manage_categories" },
                            { type: 2, style: 2, label: "Ver Ranking", emoji: { name: "🏆" }, custom_id: "stop_show_ranking" },
                        ]
                    },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 2, label: "Voltar", emoji: { name: "↩️" }, custom_id: "main_menu_back" }
                        ]
                    }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};