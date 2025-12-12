module.exports = (totalDistributed, totalItems) => {
    return {
        type: 17,
        components: [
            { type: 10, content: "## 💰 Gestão FlowCoins (Admin)", style: 1 },
            { type: 10, content: `Controle a economia interna dos administradores.\n\n📊 **Estatísticas:**\n• Total em Circulação: \`${totalDistributed} FC\`\n• Itens na Loja: \`${totalItems}\``, style: 2 },
            
            { type: 14, spacing: 2 },
            { type: 10, content: "### Ações de Estoque" },
            { 
                type: 1, 
                components: [
                    { type: 2, style: 3, label: "Adicionar Produto", emoji: { name: "➕" }, custom_id: "dev_flow_add_item" },
                    { type: 2, style: 4, label: "Remover Produto", emoji: { name: "🗑️" }, custom_id: "dev_flow_remove_item" }
                ]
            },
            { type: 14, spacing: 1 },
            { type: 10, content: "### Ações de Usuário" },
            {
                type: 1,
                components: [
                    { type: 2, style: 1, label: "Enviar Moedas (User)", emoji: { name: "💸" }, custom_id: "dev_flow_give_coins" },
                    { type: 2, style: 2, label: "Voltar", emoji: { name: "⬅️" }, custom_id: "dev_main_menu_back" }
                ]
            }
        ]
    };
};