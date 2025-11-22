// File: ui/store/customerOrdersDashboard.js
module.exports = function generateCustomerOrdersDashboard(interaction, orders, page, totalOrders, totalSpent) {
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);
    
    // Garante que a página atual é válida
    const safePage = Math.max(0, Math.min(page, totalPages - 1));
    
    const start = safePage * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const currentOrders = orders.slice(start, end);

    const components = [];

    // 1. Cabeçalho com Estatísticas do Cliente
    components.push({
        type: 10,
        content: `## 🛍️ Histórico de Pedidos de ${interaction.user.username}\n> 📊 **Resumo da Conta:**\n> 🛒 **Pedidos Totais:** \`${totalOrders}\`\n> 💰 **Total Investido:** \`R$ ${parseFloat(totalSpent).toFixed(2)}\`\n> 📅 **Cliente Desde:** <t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:R>`
    });

    components.push({ type: 14, divider: true, spacing: 1 });

    // 2. Lista de Pedidos
    if (currentOrders.length > 0) {
        const orderOptions = [];

        currentOrders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString('pt-BR');
            const time = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            
            // Tenta extrair nomes dos produtos do JSON
            let productNames = "Produto(s)";
            try {
                if (order.product_details && Array.isArray(order.product_details)) {
                    productNames = order.product_details.map(p => p.name).join(', ');
                }
            } catch (e) {}

            // Adiciona visual na lista
            components.push({
                type: 10,
                content: `### 🧾 Pedido #${order.sale_id} \n> 📅 **Data:** ${date} às ${time}\n> 📦 **Itens:** ${productNames}\n> 💲 **Valor:** R$ ${order.total_amount}\n> 🏷️ **Status:** \`${order.status.toUpperCase()}\``
            });

            // Prepara opção para o Select Menu
            orderOptions.push({
                label: `Pedido #${order.sale_id} - R$ ${order.total_amount}`,
                description: `${date} - ${productNames.substring(0, 50)}`,
                value: `order_${order.sale_id}`,
                emoji: { name: "📦" }
            });
        });

        components.push({ type: 14, divider: true, spacing: 1 });

        // 3. Menu de Seleção para Ações (Reenviar DM)
        components.push({
            type: 1,
            components: [{
                type: 3, // String Select
                custom_id: "store_customer_select_order",
                placeholder: "🔍 Selecione um pedido para ver detalhes ou resgatar...",
                options: orderOptions
            }]
        });

    } else {
        components.push({
            type: 10,
            content: "### 🏜️ Nada por aqui...\nVocê ainda não realizou nenhuma compra neste servidor."
        });
    }

    // 4. Botões de Navegação
    const navButtons = [];
    
    navButtons.push({
        type: 2,
        style: 2,
        label: "Anterior",
        emoji: { name: "⬅️" },
        custom_id: `store_myorders_page_${safePage - 1}`,
        disabled: safePage === 0
    });

    navButtons.push({
        type: 2,
        style: 2, // Botão do meio apenas mostra a página
        label: `Página ${safePage + 1} de ${totalPages || 1}`,
        custom_id: "page_info_display",
        disabled: true
    });

    navButtons.push({
        type: 2,
        style: 2,
        label: "Próxima",
        emoji: { name: "➡️" },
        custom_id: `store_myorders_page_${safePage + 1}`,
        disabled: safePage >= totalPages - 1
    });

    components.push({ type: 14, divider: true, spacing: 1 });
    components.push({ type: 1, components: navButtons });

    return [{ type: 17, components: components }];
};