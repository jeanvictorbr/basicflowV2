// Crie em: ui/ticketsAiKnowledgeMenu.js
module.exports = function generateAiKnowledgeMenu(knowledgeEntries) {
    const entryList = knowledgeEntries.length > 0
        ? knowledgeEntries.map(entry => `> 📚 **${entry.topic}** (ID: ${entry.id})\n> └─ Palavras-chave: \`${entry.keywords}\``).join('\n\n')
        : '> Nenhuma entrada de conhecimento cadastrada ainda.';

    return [
        {
            "type": 17, "accent_color": 8421504,
            "components": [
                { "type": 10, "content": "## 📚 Gerenciador da Base de Conhecimento" },
                { "type": 10, "content": "> Adicione, edite ou remova as informações que o Assistente de IA utiliza para responder aos tickets." },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": "### Entradas de Conhecimento Atuais:" },
                { "type": 10, "content": entryList },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1,
                    "components": [
                        { "type": 2, "style": 3, "label": "Adicionar", "emoji": { "name": "➕" }, "custom_id": "ai_knowledge_add" },
                        { "type": 2, "style": 1, "label": "Editar", "emoji": { "name": "✏️" }, "custom_id": "ai_knowledge_edit", "disabled": knowledgeEntries.length === 0 },
                        { "type": 2, "style": 4, "label": "Remover", "emoji": { "name": "🗑️" }, "custom_id": "ai_knowledge_remove", "disabled": knowledgeEntries.length === 0 }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1,
                    "components": [{ "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "tickets_config_ai" }]
                }
            ]
        }
    ];
};