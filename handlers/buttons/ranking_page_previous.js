// Crie em: handlers/buttons/ranking_page_previous.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');
const ITEMS_PER_PAGE = 10;

module.exports = {
    customId: 'ranking_page_',
    async execute(interaction) {
        // Este handler será chamado dinamicamente pelo index.js
        const page = parseInt(interaction.customId.split('_')[2]);
        if (isNaN(page)) return;
        
        await interaction.deferUpdate();

        const offset = page * ITEMS_PER_PAGE;
        const leaderboardData = await db.query(
            `SELECT user_id, total_ms FROM ponto_leaderboard WHERE guild_id = $1 ORDER BY total_ms DESC LIMIT $2 OFFSET $3`,
            [interaction.guild.id, ITEMS_PER_PAGE, offset]
        );
        const totalCount = (await db.query('SELECT COUNT(*) FROM ponto_leaderboard WHERE guild_id = $1', [interaction.guild.id])).rows[0].count;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        const embed = EmbedBuilder.from(interaction.message.embeds[0])
            .setFooter({ text: `Página ${page + 1} de ${totalPages || 1}` });

        const rankingList = await Promise.all(leaderboardData.rows.map(async (row, index) => {
            const member = await interaction.guild.members.fetch(row.user_id).catch(() => null);
            const position = offset + index + 1;
            return `**${position}.** ${member || '`Usuário Saiu`'} - \`${formatDuration(row.total_ms)}\``;
        }));
        embed.setDescription(rankingList.join('\n'));
        
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`ranking_page_${page - 1}`).setLabel('<').setStyle(ButtonStyle.Primary).setDisabled(page === 0),
            new ButtonBuilder().setCustomId(`ranking_page_${page + 1}`).setLabel('>').setStyle(ButtonStyle.Primary).setDisabled(page + 1 >= totalPages)
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    }
};