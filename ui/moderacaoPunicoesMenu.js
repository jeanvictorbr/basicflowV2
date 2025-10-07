// Crie em: ui/moderacaoPunicoesMenu.js
module.exports = function generateModeracaoPunicoesMenu(punishments) {
    const punishmentList = punishments.length > 0
        ? punishments.map(p => {
            const role = p.role_id ? ` | Cargo: <@&${p.role_id}>` : '';
            const duration = p.duration ? ` | Duração: \`${p.duration}\`` : '';
            return `> **${p.name}** \`[${p.action}]\`${duration}${role}`;
        }).join('\n\n')
        : '> Nenhuma punição personalizada criada ainda.';

    return [
        {
            "type": 17, "accent_color": 11393254,
            "components": [
                { "type": 10, "content": "## ⚖️ Gestor de Punições Personalizadas" },
                { "type": 10, "content": "> Crie modelos de punição com cargos e durações pré-definidas para agilizar e padronizar as ações da sua equipa." },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Punições Configuradas:" },
                { "type": 10, "content": punishmentList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Adicionar Punição", "emoji": { "name": "➕" }, "custom_id": "mod_punicao_add" },
                        { "type": 2, "style": 4, "label": "Remover Punição", "emoji": { "name": "🗑️" }, "custom_id": "mod_punicao_remove", "disabled": punishments.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "mod_open_premium_hub" }] }
            ]
        }
    ];
};