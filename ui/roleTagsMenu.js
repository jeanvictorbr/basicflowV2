// ui/roleTagsMenu.js
module.exports = function generateRoleTagsMenu(tags = []) {
    const tagList = tags.length > 0
        ? tags.map(t => `> <@&${t.role_id}> → \`${t.tag}\``).join('\n')
        : '> Nenhuma tag configurada ainda.';

    return [
        {
            "type": 17, "accent_color": 1146986,
            "components": [
                { "type": 10, "content": "## 🏷️ Gerenciador de Tags por Cargo (RoleTags)" },
                { "type": 10, "content": "> Associe tags de texto a cargos. O bot aplicará a tag do cargo mais alto do membro ao apelido dele automaticamente." },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Tags Atuais:" },
                { "type": 10, "content": tagList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 3, "label": "Adicionar / Editar", "emoji": { "name": "➕" }, "custom_id": "roletags_add" },
                        { "type": 2, "style": 4, "label": "Remover", "emoji": { "name": "🗑️" }, "custom_id": "roletags_remove", "disabled": tags.length === 0 },
                        { "type": 2, "style": 1, "label": "Sincronizar Todos", "emoji": { "name": "🔄" }, "custom_id": "roletags_sync_all", "disabled": tags.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "main_menu_back" }] }
            ]
        }
    ];
};