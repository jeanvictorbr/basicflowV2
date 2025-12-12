module.exports = (items, balance) => {
    // items: array de objetos do banco
    // balance: saldo do usuário

    const header = {
        type: 10,
        content: `## 🛒 Loja FlowCoins\n👛 **Seu Saldo:** \`${balance} FC\`\n\nFarm moedas usando \`/daily\` e troque por features premium para seus servidores!`,
        style: 1
    };

    if (items.length === 0) {
        return {
            type: 17,
            components: [
                header,
                { type: 10, content: "🚫 *A loja está vazia no momento. Fale com o desenvolvedor.*", style: 3 }
            ]
        };
    }

    // Cria uma seção para cada item
    const itemComponents = items.map(item => {
        const canAfford = balance >= item.price;
        
        return {
            type: 9, // Section
            accessory: {
                type: 2, // Button
                style: canAfford ? 1 : 2, // Roxo se pode comprar, Cinza se não
                label: `${item.price} FC`,
                emoji: { name: canAfford ? "🛒" : "🔒" },
                custom_id: `flow_buy_start_${item.id}`,
                disabled: !canAfford
            },
            components: [
                { type: 10, content: `${item.emoji || '📦'} **${item.name}**` },
                { type: 10, content: `${item.description || 'Sem descrição'} • Duração: ${item.duration_days} dias` }
            ]
        };
    });

    // Adiciona separadores entre os itens
    const finalComponents = [header, { type: 14, spacing: 2 }];
    itemComponents.forEach(comp => {
        finalComponents.push(comp);
        finalComponents.push({ type: 14, spacing: 1 }); // Separador
    });

    return {
        type: 17,
        components: finalComponents
    };
};