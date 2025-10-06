// Crie em: handlers/buttons/ponto_show_ranking.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');

const ITEMS_PER_PAGE = 10;

module.exports = {
    customId: 'ponto_show_ranking',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const page = 0;
        const offset = page * ITEMS_PER_PAGE;

        const leaderboardData = await db.query(
            `SELECT user_id, total_ms FROM ponto_leaderboard WHERE guild_id = $1 ORDER BY total_ms DESC LIMIT $2 OFFSET $3`,
            [interaction.guild.id, ITEMS_PER_PAGE, offset]
        );
        const totalCount = (await db.query('SELECT COUNT(*) FROM ponto_leaderboard WHERE guild_id = $1', [interaction.guild.id])).rows[0].count;
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

        const embed = new EmbedBuilder()
            .setColor('#FFD700') // Dourado
            .setTitle('🏆 Ranking de Ponto')
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: `Página ${page + 1} de ${totalPages || 1}` });

        if (leaderboardData.rows.length === 0) {
            embed.setDescription('Ninguém bateu o ponto ainda.');
        } else {
            const rankingList = await Promise.all(leaderboardData.rows.map(async (row, index) => {
                const member = await interaction.guild.members.fetch(row.user_id).catch(() => null);
                const position = offset + index + 1;
                return `**${position}.** ${member || '`Usuário Saiu`'} - \`${formatDuration(row.total_ms)}\``;
            }));
            embed.setDescription(rankingList.join('\n'));
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`ranking_page_0`).setLabel('<').setStyle(ButtonStyle.Primary).setDisabled(true),
            new ButtonBuilder().setCustomId(`ranking_page_1`).setLabel('>').setStyle(ButtonStyle.Primary).setDisabled(totalPages <= 1)
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
    }
};