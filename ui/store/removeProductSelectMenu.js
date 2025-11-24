// Crie em: ui/store/removeProductSelectMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateRemoveProductSelectMenu(products, currentPage, totalPages, isSearch = false, searchQuery = null) {
    if (!products || !Array.isArray(products)) products = [];
    currentPage = parseInt(currentPage) || 0;
    totalPages = parseInt(totalPages) || 1;

    const options = products.map(p => {
        let priceFormatted = "R$ 0,00";
        try { priceFormatted = parseFloat(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } catch (e) {}
        
        return {
            label: p.name ? p.name.substring(0, 100) : 'Sem Nome',
            description: `ID: ${p.id} | 💰 ${priceFormatted} | Clique para DELETAR`,
            value: p.id.toString(),
            emoji: '🗑️'
        };
    });

    let placeholderText = `📖 Página ${currentPage + 1} de ${totalPages} - Selecione para EXCLUIR...`;
    if (options.length === 0) {
        options.push({ label: 'Nenhum produto', value: 'no_result', emoji: '🚫' });
        placeholderText = "🚫 Lista Vazia";
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_store_remove_product')
        .setPlaceholder(isSearch ? `🔎 Busca: "${searchQuery}"` : placeholderText)
        .addOptions(options)
        .setDisabled(options[0].value === 'no_result');

    const paginationButtons = [];
    if (!isSearch && totalPages > 1) {
        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages - 1, currentPage + 2);
        if (currentPage < 2) end = Math.min(totalPages - 1, 4);
        if (currentPage > totalPages - 3) start = Math.max(0, totalPages - 5);

        for (let i = start; i <= end; i++) {
            paginationButtons.push(
                new ButtonBuilder()
                    .setCustomId(`store_remove_pg_${i}`) // ID ÚNICO DE REMOÇÃO
                    .setLabel(`${i + 1}`)
                    .setStyle(i === currentPage ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(i === currentPage)
            );
        }
    }

    const controlButtons = [
        new ButtonBuilder().setCustomId('store_remove_search').setLabel('Pesquisar').setEmoji('🔍').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('store_manage_products').setLabel('Voltar').setStyle(ButtonStyle.Danger)
    ];

    const rows = [new ActionRowBuilder().addComponents(selectMenu)];
    if (paginationButtons.length > 0) rows.push(new ActionRowBuilder().addComponents(paginationButtons));
    rows.push(new ActionRowBuilder().addComponents(controlButtons));

    const time = new Date().toLocaleTimeString('pt-BR');
    return [
        {
            type: 17,
            components: [{ type: 10, content: `> **🗑️ Remover Produto** | Pág. ${currentPage + 1}/${totalPages} (${products.length} itens)\n> *Cuidado: Ação irreversível após confirmação.*` }]
        },
        ...rows
    ];
};