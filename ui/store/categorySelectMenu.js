// Crie em: ui/store/categorySelectMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateCategorySelectMenu(categories, currentPage, totalPages, mode, isSearch = false, searchQuery = null) {
    // mode: 'edit' ou 'remove'
    if (!categories || !Array.isArray(categories)) categories = [];
    currentPage = parseInt(currentPage) || 0;
    totalPages = parseInt(totalPages) || 1;

    // Configurações Visuais
    let placeholder, selectId, emojiIcon;
    if (mode === 'remove') {
        selectId = 'select_store_remove_category';
        placeholder = 'Selecione para REMOVER...';
        emojiIcon = '🗑️';
    } else {
        selectId = 'select_store_edit_category';
        placeholder = 'Selecione para EDITAR...';
        emojiIcon = '✏️';
    }

    // 1. Opções
    const options = categories.map(c => ({
        label: c.name.substring(0, 100),
        description: `ID: ${c.id} | Clique para ${mode === 'remove' ? 'excluir' : 'configurar'}`,
        value: c.id.toString(),
        emoji: emojiIcon
    }));

    if (options.length === 0) {
        options.push({ label: 'Nenhuma categoria encontrada', value: 'no_result', emoji: '🚫' });
        placeholder = "🚫 Lista Vazia";
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder(isSearch ? `🔎 Busca: "${searchQuery}"` : `${placeholder} (Pág ${currentPage + 1}/${totalPages})`)
        .addOptions(options)
        .setDisabled(options[0].value === 'no_result');

    // 2. Paginação (Régua Numérica)
    const paginationButtons = [];
    if (!isSearch && totalPages > 1) {
        let start = Math.max(0, currentPage - 2);
        let end = Math.min(totalPages - 1, currentPage + 2);
        if (currentPage < 2) end = Math.min(totalPages - 1, 4);
        if (currentPage > totalPages - 3) start = Math.max(0, totalPages - 5);

        for (let i = start; i <= end; i++) {
            paginationButtons.push(
                new ButtonBuilder()
                    // ID: store_cats_pg_MODE_PAGINA (Ex: store_cats_pg_edit_2)
                    .setCustomId(`store_cats_pg_${mode}_${i}`)
                    .setLabel(`${i + 1}`)
                    .setStyle(i === currentPage ? ButtonStyle.Success : ButtonStyle.Secondary)
                    .setDisabled(i === currentPage)
            );
        }
    }

    // 3. Controles
    const controlButtons = [
        // Botão Pesquisar
        new ButtonBuilder().setCustomId(`store_cats_search_${mode}`).setLabel('Pesquisar').setEmoji('🔍').setStyle(ButtonStyle.Primary),
        // Botão Voltar (Para o menu principal de categorias)
        new ButtonBuilder().setCustomId('store_manage_categories').setLabel('Voltar').setStyle(ButtonStyle.Danger)
    ];

    const rows = [new ActionRowBuilder().addComponents(selectMenu)];
    if (paginationButtons.length > 0) rows.push(new ActionRowBuilder().addComponents(paginationButtons));
    rows.push(new ActionRowBuilder().addComponents(controlButtons));

    const time = new Date().toLocaleTimeString('pt-BR');
    const title = mode === 'remove' ? '> **🗑️ Remover Categoria**' : '> **✏️ Editar Categoria**';

    return [
        {
            type: 17,
            components: [{ type: 10, content: `${title} | Pág. ${currentPage + 1}/${totalPages}\n> *Atualizado às ${time}*` }]
        },
        ...rows
    ];
};