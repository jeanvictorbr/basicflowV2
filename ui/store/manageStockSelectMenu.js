// Substitua em: ui/store/manageStockSelectMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateManageStockSelectMenu(products, currentPage, totalPages, isSearch = false, searchQuery = null) {
    // 1. Validação de Segurança
    if (!products || !Array.isArray(products)) products = [];
    currentPage = parseInt(currentPage) || 0;
    totalPages = parseInt(totalPages) || 1;

    // 2. Opções do Menu (Lista de Produtos)
    const options = products.map(p => {
        let priceFormatted = "R$ 0,00";
        try {
            priceFormatted = parseFloat(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        } catch (e) { priceFormatted = `R$ ${p.price}`; }
        
        return {
            label: p.name ? p.name.substring(0, 100) : 'Sem Nome',
            description: `ID: ${p.id} | 💰 ${priceFormatted}`,
            value: p.id.toString(),
            emoji: '📦'
        };
    });

    let placeholderText = `📖 Página ${currentPage + 1} de ${totalPages} - Selecione...`;
    
    if (options.length === 0) {
        options.push({ label: 'Nenhum produto nesta página', value: 'no_result', emoji: '🚫' });
        placeholderText = "🚫 Página Vazia";
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_store_manage_stock')
        .setPlaceholder(isSearch ? `🔎 Busca: "${searchQuery}"` : placeholderText)
        .addOptions(options)
        .setDisabled(options[0].value === 'no_result');

    // 3. Botões Numéricos (Lógica Simplificada)
    const paginationButtons = [];

    if (!isSearch && totalPages > 1) {
        // Mostra uma janela de 5 páginas
        // Se estamos na pág 0: Mostra 1, 2, 3, 4, 5
        // Se estamos na pág 10: Mostra 9, 10, 11, 12, 13
        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages - 1, currentPage + 2);

        // Ajuste se estivermos no começo (mostra mais adiante para preencher 5)
        if (currentPage < 2) {
            end = Math.min(totalPages - 1, 4);
        }
        // Ajuste se estivermos no fim (mostra mais atrás para preencher 5)
        if (currentPage > totalPages - 3) {
            start = Math.max(0, totalPages - 5);
        }

        for (let i = start; i <= end; i++) {
            paginationButtons.push(
                new ButtonBuilder()
                    // ID SIMPLES: Apenas 'pg_' e o número. Sem setas, sem sufixos.
                    .setCustomId(`store_stock_pg_${i}`) 
                    .setLabel(`${i + 1}`)
                    .setStyle(i === currentPage ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(i === currentPage) // Desativa o botão da página atual
            );
        }
    }

    // 4. Botões de Controle
    const controlButtons = [
        new ButtonBuilder().setCustomId('store_manage_stock_search').setLabel('Pesquisar').setEmoji('🔍').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('store_manage_products').setLabel('Voltar').setStyle(ButtonStyle.Danger)
    ];

    // 5. Montar as Linhas (Rows)
    const rows = [new ActionRowBuilder().addComponents(selectMenu)];
    
    // Adiciona a régua de números se houver botões
    if (paginationButtons.length > 0) {
        rows.push(new ActionRowBuilder().addComponents(paginationButtons));
    }
    
    rows.push(new ActionRowBuilder().addComponents(controlButtons));

    // 6. Retorno
    const time = new Date().toLocaleTimeString('pt-BR');
    return [
        {
            type: 17,
            components: [{ 
                type: 10, 
                content: `> **📦 Estoque Real** | Visualizando página **${currentPage + 1}** de **${totalPages}**\n> *Atualizado às ${time}*` 
            }]
        },
        ...rows
    ];
};