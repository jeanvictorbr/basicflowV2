// Renomeie 'ponto_refresh_dashboard.js' para 'ponto_meu_status.js' se ele existir, ou crie este novo arquivo.
// O conteúdo deve ser este:
// handlers/buttons/ponto_meu_status.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');

module.exports = {
    customId: 'ponto_meu_status',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const member = interaction.member;

        // Busca os dados do ranking
        const leaderboardData = (await db.query('SELECT total_ms FROM ponto_leaderboard WHERE user_id = $1 AND guild_id = $2', [userId, interaction.guild.id])).rows[0];
        const allUsers = (await db.query('SELECT user_id FROM ponto_leaderboard WHERE guild_id = $1 ORDER BY total_ms DESC', [interaction.guild.id])).rows;
        const rank = allUsers.findIndex(user => user.user_id === userId) + 1;

        // Verifica se é admin
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

        // Formata a listaa de cargos
        const roles = member.roles.cache
            .filter(role => role.name !== '@everyone')
            .map(role => `<@&${role.id}>`)
            .join(', ');

        const reportEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle(`Dossiê de Ponto: ${member.user.tag}`)
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: '👤 Usuário', value: `<@${userId}>`, inline: true },
                { name: '👑 Status', value: isAdmin ? 'Administrador' : 'Membro', inline: true },
                { name: '🗓️ Entrada no Servidor', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>` },
                { name: '💼 Cargos', value: roles.substring(0, 1024) || 'Nenhum cargo' },
                { name: '🏆 Posição no Ranking', value: rank > 0 ? `**#${rank}** de ${allUsers.length}` : 'Não Ranqueado', inline: true },
                { name: '⏱️ Tempo Total de Serviço', value: `\`${leaderboardData ? formatDuration(leaderboardData.total_ms) : '00:00:00'}\``, inline: true }
            )
            .setFooter({ text: `Servidor: ${interaction.guild.name}` })
            .setTimestamp();

        await interaction.editReply({ embeds: [reportEmbed] });
    }
};