// Substitua o conteúdo em: ui/devPanel/devKeyRevokeMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const ITEMS_PER_PAGE = 25;

module.exports = function generateDevKeyRevokeMenu(keys, page = 0) {
    const totalPages = Math.ceil(keys.length / ITEMS_PER_PAGE);
    const paginatedKeys = keys.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

    const keyOptions = paginatedKeys.map(key => ({
        label: `Chave: ${key.key}`,
        description: `Features: ${key.grants_features} | Usos: ${key.uses_left}`,
        value: key.key,
    }));

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_dev_key_revoke')
        .setPlaceholder('Selecione uma ou mais chaves para revogar...')
        .setMinValues(1)
        .setMaxValues(keyOptions.length > 0 ? keyOptions.length : 1)
        .addOptions(keyOptions.length > 0 ? keyOptions : [{ label: 'Nenhuma chave nesta página', value: 'none', default: true }]);

    if (keyOptions.length === 0) {
        selectMenu.setDisabled(true);
    }
        
    const selectRow = new ActionRowBuilder().addComponents(selectMenu);

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`dev_key_revoke_page_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId(`dev_key_revoke_page_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
    );

    const backRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('dev_manage_keys').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️')
    );

    const actionComponents = [selectRow.toJSON()];
    if (totalPages > 1) {
        actionComponents.push(paginationRow.toJSON());
    }
    actionComponents.push(backRow.toJSON());

    // CORREÇÃO: Estrutura alterada para V2 Components
    return [
        {
            "type": 17,
            "accent_color": 15844367, // Cor padrão do DevPanel
            "components": [
                { "type": 10, "content": `## 🗑️ Revogar Chaves` },
                { "type": 10, "content": `> Selecione as chaves que deseja remover permanentemente.\n> **Página ${page + 1} de ${totalPages || 1}**` },
                { "type": 14, "divider": true, "spacing": 1 },
                ...actionComponents.map(row => ({ "type": 1, "components": row.components }))
            ]
        }
    ];
};