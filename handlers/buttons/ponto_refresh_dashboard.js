// Renomeie 'ponto_refresh_dashboard.js' para 'ponto_meu_status.js'
// Substitua o conteúdo pelo código abaixo:
// handlers/buttons/ponto_meu_status.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const { formatDuration } = require('../../utils/formatDuration.js');

module.exports = {
    customId: 'ponto_meu_status',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const userId = interaction.user.id;
        const member = interaction.member;

        const leaderboardData = (await db.query('SELECT total_ms FROM ponto_leaderboard WHERE user_id = $1 AND guild_id = $2', [userId, interaction.guild.id])).rows[0];
        const activeSession = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [userId, interaction.guild.id])).rows[0];

        const reportEmbed = new EmbedBuilder()
            .setColor('#3498DB')
            .setAuthor({ name: `Seu Dossiê de Ponto - ${member.user.tag}`, iconURL: member.user.displayAvatarURL() })
            .setThumbnail(member.user.displayAvatarURL())
            .addFields({ name: 'Tempo Total no Ranking', value: `\`${leaderboardData ? formatDuration(leaderboardData.total_ms) : '00:00:00'}\`` })
            .setTimestamp();

        if (activeSession) {
            const startTime = new Date(activeSession.start_time);
            let elapsedTimeMs = Date.now() - startTime.getTime();
            if (activeSession.is_paused) {
                const lastPause = new Date(activeSession.last_pause_time);
                const currentPauseDuration = Date.now() - lastPause.getTime();
                elapsedTimeMs -= ((activeSession.total_paused_ms || 0) + currentPauseDuration);
            } else {
                elapsedTimeMs -= (activeSession.total_paused_ms || 0);
            }

            reportEmbed.addFields(
                { name: 'Status Atual', value: activeSession.is_paused ? '⏸️ Pausado' : '▶️ Em Serviço' },
                { name: 'Início da Sessão Atual', value: `<t:${Math.floor(startTime.getTime() / 1000)}:R>` },
                { name: 'Tempo na Sessão Atual', value: `\`${formatDuration(elapsedTimeMs)}\`` }
            );
        } else {
            reportEmbed.addFields({ name: 'Status Atual', value: '⏹️ Fora de Serviço' });
        }

        await interaction.editReply({ embeds: [reportEmbed] });
    }
};