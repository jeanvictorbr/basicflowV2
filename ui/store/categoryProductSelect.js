// Substitua em: ui/store/categoryProductSelect.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateCategoryProductSelect(products, currentPage, totalPages, mode, categoryId, isSearch = false, searchQuery = null) {
    
    if (!products || !Array.isArray(products)) products = [];
    currentPage = parseInt(currentPage) || 0;
    totalPages = parseInt(totalPages) || 1;

    // 1. Configuração Visual e IDs
    let placeholder, selectId, emojiIcon, actionText;

    if (mode === 'add') {
        selectId = `select_store_cat_product_add_${categoryId}`;
        placeholder = 'Selecione para ADICIONAR...';
        emojiIcon = '📥';
        actionText = 'ADICIONAR';
    } else if (mode === 'remove') {
        selectId = `select_store_cat_product_remove_${categoryId}`;
        placeholder = 'Selecione para REMOVER...';
        emojiIcon = '📤';
        actionText = 'REMOVER';
    } else {
        // MODO EDIT:
        // AQUI ESTÁ O TRUQUE: Usamos um ID novo 'select_store_cat_edit_' que carrega o ID da categoria.
        // Isso diferencia este menu do menu geral de produtos.
        selectId = `select_store_cat_edit_${categoryId}`; 
        placeholder = 'Selecione para EDITAR...';
        emojiIcon = '📝';
        actionText = 'EDITAR';
    }

    // 2. Opções
    const options = products.map(p => {
        let priceFormatted = `R$ ${p.price}`; 
        try { priceFormatted = parseFloat(p.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } catch (e) {}
        
        return {
            label: p.name.substring(0, 100),
            description: `ID: ${p.id} | ${priceFormatted} | ${actionText}`,
            value: p.id.toString(),
            emoji: emojiIcon
        };
    });

    if (options.length === 0) {
        options.push({ label: 'Nenhum produto disponível', value: 'no_result', emoji: '🚫' });
        placeholder = "🚫 Lista Vazia";
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder(isSearch ? `🔎 Busca: "${searchQuery}"` : `${placeholder} (Pág ${currentPage + 1}/${totalPages})`)
        .addOptions(options)
        .setDisabled(options[0].value === 'no_result');

    // 3. Paginação
    const paginationButtons = [];
    if (!isSearch && totalPages > 1) {
        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages - 1, currentPage + 2);
        if (currentPage < 2) end = Math.min(totalPages - 1, 4);
        if (currentPage > totalPages - 3) start = Math.max(0, totalPages - 5);

        for (let i = start; i <= end; i++) {
            paginationButtons.push(
                new ButtonBuilder()
                    .setCustomId(`store_cat_pg_${mode}_${categoryId}_${i}`)
                    .setLabel(`${i + 1}`)
                    .setStyle(i === currentPage ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(i === currentPage)
            );
        }
    }

    // 4. Controles
    const controlButtons = [
        new ButtonBuilder().setCustomId(`store_cat_search_${mode}_${categoryId}`).setLabel('Pesquisar').setEmoji('🔍').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`store_manage_category_products_${categoryId}`).setLabel('Voltar').setStyle(ButtonStyle.Danger)
    ];

    const rows = [new ActionRowBuilder().addComponents(selectMenu)];
    if (paginationButtons.length > 0) rows.push(new ActionRowBuilder().addComponents(paginationButtons));
    rows.push(new ActionRowBuilder().addComponents(controlButtons));

    const time = new Date().toLocaleTimeString('pt-BR');
    let title = `> **📂 Gerenciando Categoria** | ${actionText}`;
    
    return [
        {
            type: 17,
            components: [{ type: 10, content: `${title} | Pág. ${currentPage + 1}/${totalPages}\n> *Atualizado às ${time}*` }]
        },
        ...rows
    ];
};