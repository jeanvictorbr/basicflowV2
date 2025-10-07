// Crie em: ui/moderacaoBansMenu.js
module.exports = function generateModeracaoBansMenu(bannedUsers) {
    const banList = bannedUsers.length > 0
        ? bannedUsers.map(ban => {
            const reason = ban.reason ? `\n> └─ Motivo: *${ban.reason.substring(0, 100)}*` : '';
            return `> 🚫 **${ban.user.tag}** (\`${ban.user.id}\`)${reason}`;
        }).join('\n\n')
        : '> Nenhum membro banido encontrado neste servidor.';

    return [
        {
            "type": 17, "accent_color": 11393254,
            "components": [
                { "type": 10, "content": "## 🚫 Dashboard de Banimentos" },
                { "type": 10, "content": "> Lista de todos os membros banidos do servidor." },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": banList },
                { "type": 14, "divider": true, "spacing": 2 },
                { "type": 1, "components": [
                    { "type": 2, "style": 4, "label": "Revogar Ban (por ID)", "emoji": { "name": "🔓" }, "custom_id": "mod_unban_id" },
                    { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "mod_open_premium_hub" }
                ]}
            ]
        }
    ];
};