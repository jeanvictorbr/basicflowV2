// Crie este arquivo em: ui/stopCategoriesMenu.js
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = function generateStopCategoriesMenu(categories = []) {
    const categoryList = categories.length > 0
        ? categories.map(cat => `> • ${cat.name}`).join('\n')
        : '> Nenhuma categoria personalizada. O jogo usará as categorias padrão.';

    return {
        components: [
            {
                type: 17,
                accent_color: 5814783,
                components: [
                    { type: 10, content: "## ⚙️ Gerenciar Categorias do Stop!" },
                    { type: 10, content: "> Adicione ou remova as categorias que aparecerão nas rodadas do jogo." },
                    { type: 14, divider: true, spacing: 1 },
                    { type: 10, content: "### Categorias Atuais:" },
                    { type: 10, content: categoryList },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1,
                        components: [
                            { type: 2, style: 3, label: "Adicionar", emoji: { name: "➕" }, custom_id: "stop_category_add" },
                            { type: 2, style: 4, label: "Remover", emoji: { name: "🗑️" }, custom_id: "stop_category_remove", disabled: categories.length === 0 },
                            { type: 2, style: 4, label: "Resetar Padrão", emoji: { name: "🔄" }, custom_id: "stop_category_reset" }
                        ]
                    },
                    { type: 14, divider: true, spacing: 1 },
                    {
                        type: 1,
                        components: [{ type: 2, style: 2, label: "Voltar", emoji: { name: "↩️" }, custom_id: "open_minigames_hub" }]
                    }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};