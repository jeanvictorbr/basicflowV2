// Substitua o conteúdo de: ui/automations/giveawayMenu.js
module.exports = function giveawayMenu() {
    return {
        type: 17,
        components: [
            { type: 10, content: "## 🎉 Gerenciador de Sorteios\nCrie e gerencie sorteios automáticos no seu servidor de forma simples." },
            { type: 14, divider: true, spacing: 2 },
            {
                type: 1,
                components: [
                    { type: 2, style: 3, label: "Criar Novo Sorteio", emoji: { name: "➕" }, custom_id: "aut_gw_create_start" },
                    { type: 2, style: 2, label: "Configurar Logs", emoji: { name: "📜" }, custom_id: "aut_gw_config_logs" }, // Novo botão
                    { type: 2, style: 2, label: "Voltar", custom_id: "open_automations_menu" }
                ]
            }
        ]
    };
};