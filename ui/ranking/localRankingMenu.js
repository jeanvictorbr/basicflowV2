// ui/ranking/localRankingMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatDuration } = require('../../utils/formatDuration.js');

const ITEMS_PER_PAGE = 10;

module.exports = function generateLocalRankingMenu(type, rankingData = [], totalItems, page = 0, guild) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const titleMap = {
        ponto: '⏰ Ranking Local de Ponto',
        hangman: '💀 Ranking Local da Forca',
        stop: '🛑 Ranking Local do Stop!',
    };

    const medals = ['🥇', '🥈', '🥉'];
    const rankingList = rankingData.map((player, index) => {
        const position = page * ITEMS_PER_PAGE + index + 1;
        const medal = medals[position - 1] || `**${position}.**`;
        const value = type === 'ponto'
            ? `\`${formatDuration(player.total_ms)}\``
            : `\`${player.points}\` pontos`;
        return `${medal} <@${player.user_id}> - ${value}`;
    }).join('\n');

    const typeButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ranking_local_show_ponto').setLabel('Ponto').setStyle(ButtonStyle.Primary).setEmoji('⏰').setDisabled(type === 'ponto'),
        new ButtonBuilder().setCustomId('ranking_local_show_hangman').setLabel('Forca').setStyle(ButtonStyle.Primary).setEmoji('💀').setDisabled(type === 'hangman'),
        new ButtonBuilder().setCustomId('ranking_local_show_stop').setLabel('Stop!').setStyle(ButtonStyle.Primary).setEmoji('🛑').setDisabled(type === 'stop')
    );

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`ranking_local_page_${type}_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId('ranking_hub_back').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️'),
        new ButtonBuilder().setCustomId(`ranking_local_page_${type}_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Secondary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17,
            "accent_color": 15844367, // Gold
            "components": [
                {
                    "type": 9,
                    "accessory": { "type": 11, "media": { "url": guild.iconURL() } },
                    "components": [
                        { "type": 10, "content": `## 🏠 ${titleMap[type]}` },
                        { "type": 10, "content": `> Página ${page + 1} de ${totalPages || 1}.` }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 1, "components": typeButtons.toJSON().components },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": rankingList || "> Nenhum dado encontrado para este ranking." },
                { "type": 14, "divider": true, "spacing": 2 },
                totalPages > 1 ? { "type": 1, "components": paginationRow.toJSON().components } : { "type": 1, "components": [paginationRow.components[1]] }
            ].filter(Boolean)
        }
    ];
};