// Crie em: ui/moderacaoHub.js
module.exports = function generateModeracaoHub(interaction) {
    return [
        {
            "type": 17, "accent_color": 15158332,
            "components": [
                {
                    "type": 10, "content": `## ⚖️ Central de Moderação`
                },
                {
                    "type": 10, "content": `> Bem-vindo(a), ${interaction.user.username}. Utilize as ferramentas abaixo para gerir os membros do servidor.`
                },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Procurar Membro", "emoji": { "name": "🔎" }, "custom_id": "mod_procurar_membro" },
                        { "type": 2, "style": 2, "label": "Minhas Ações Recentes", "emoji": { "name": "📋" }, "custom_id": "mod_minhas_acoes" }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "open_moderacao_menu" }
                    ]
                }
            ]
        }
    ];
};