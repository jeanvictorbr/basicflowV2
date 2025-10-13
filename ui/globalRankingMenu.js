// Crie em: ui/globalRankingMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatDuration } = require('../utils/formatDuration.js');

const ITEMS_PER_PAGE = 10;

module.exports = async function generateGlobalRankingMenu(client, type, rankingData = [], totalItems, page = 0) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    const titleMap = {
        ponto: '⏰ Ranking Global de Ponto',
        hangman: '💀 Ranking Global da Forca',
        stop: '🛑 Ranking Global do Stop!',
    };

    const rankingPromises = rankingData.map(async (player, index) => {
        const position = page * ITEMS_PER_PAGE + index + 1;
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[position - 1] || `**${position}.**`;
        
        const user = await client.users.fetch(player.user_id).catch(() => ({ tag: 'Usuário Desconhecido' }));
        const guild = client.guilds.cache.get(player.guild_id);
        const guildName = guild ? guild.name : 'Servidor Oculto';

        const value = type === 'ponto'
            ? `\`${formatDuration(player.global_total)}\``
            : `\`${player.global_total}\` pontos`;

        return `${medal} **${user.tag}** (*${guildName}*) - ${value}`;
    });

    const rankingList = (await Promise.all(rankingPromises)).join('\n');

    const typeButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('global_ranking_show_ponto').setLabel('Ponto').setStyle(ButtonStyle.Primary).setEmoji('⏰').setDisabled(type === 'ponto'),
        new ButtonBuilder().setCustomId('global_ranking_show_hangman').setLabel('Forca').setStyle(ButtonStyle.Primary).setEmoji('💀').setDisabled(type === 'hangman'),
        new ButtonBuilder().setCustomId('global_ranking_show_stop').setLabel('Stop!').setStyle(ButtonStyle.Primary).setEmoji('🛑').setDisabled(type === 'stop')
    );

    const paginationRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`global_ranking_page_${type}_${page - 1}`).setLabel('Anterior').setStyle(ButtonStyle.Secondary).setDisabled(page === 0),
        new ButtonBuilder().setCustomId('open_minigames_hub').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('↩️'),
        new ButtonBuilder().setCustomId(`global_ranking_page_${type}_${page + 1}`).setLabel('Próxima').setStyle(ButtonStyle.Secondary).setDisabled(page + 1 >= totalPages)
    );

    return [
        {
            "type": 17,
            "accent_color": 15844367, // Gold
            "components": [
                { "type": 10, "content": `## 🌍 ${titleMap[type]}` },
                { "type": 10, "content": `> Os melhores jogadores de todas as comunidades! Página ${page + 1} de ${totalPages || 1}.` },
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