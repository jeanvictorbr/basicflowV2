// Crie em: ui/pontoDashboardPessoal.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatDuration } = require('../utils/formatDuration.js'); // Criaremos este arquivo a seguir

module.exports = function generatePontoDashboard(interaction, session) {
    const startTime = new Date(session.start_time);
    let elapsedTimeMs = Date.now() - startTime.getTime();
    if (!session.is_paused) {
        elapsedTimeMs -= session.total_paused_ms;
    } else {
        const lastPause = new Date(session.last_pause_time);
        const currentPauseDuration = Date.now() - lastPause.getTime();
        elapsedTimeMs -= (session.total_paused_ms + currentPauseDuration);
    }

    const embed = new EmbedBuilder()
        .setColor(session.is_paused ? '#E67E22' : '#2ECC71') // Laranja para pausado, Verde para ativo
        .setTitle('Dashboard de Serviço')
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
            { name: 'Status', value: session.is_paused ? '⏸️ Pausado' : '▶️ Em Serviço' },
            { name: 'Início do Serviço', value: `<t:${Math.floor(startTime.getTime() / 1000)}:R>` },
            { name: 'Tempo Decorrido', value: `\`${formatDuration(elapsedTimeMs)}\`` }
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(session.is_paused ? 'ponto_resume_service' : 'ponto_pause_service')
            .setLabel(session.is_paused ? 'Retomar' : 'Pausar')
            .setStyle(session.is_paused ? ButtonStyle.Success : ButtonStyle.Secondary)
            .setEmoji(session.is_paused ? '▶️' : '⏸️'),
        new ButtonBuilder()
            .setCustomId('ponto_end_service')
            .setLabel('Sair de Serviço')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('⏹️')
    );

    return { embeds: [embed], components: [row] };
};