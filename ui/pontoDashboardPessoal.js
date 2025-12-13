// ui/pontoDashboardPessoal.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatDuration } = require('../utils/formatDuration.js');

module.exports = function generatePontoDashboard(interaction, session, status = 'active') {
    const startTime = new Date(session.start_time);
    
    // [NOVO] Timestamp UNIX para o contador do Discord
    const startUnix = Math.floor(startTime.getTime() / 1000);

    let elapsedTimeMs = Date.now() - startTime.getTime();

    const embed = new EmbedBuilder()
        .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
        .setThumbnail(interaction.user.displayAvatarURL());

    const components = [];

    if (status === 'finalizado') {
        elapsedTimeMs = session.durationMs; // Usa a duração final calculada
        embed
            .setColor('#ED4245') // Vermelho
            .setTitle('Serviço Finalizado')
            .addFields(
                { name: 'Status', value: '⏹️ Finalizado' },
                { name: 'Início do Serviço', value: `<t:${startUnix}:f>` },
                { name: 'Tempo Total de Serviço', value: `\`${formatDuration(elapsedTimeMs)}\`` }
            );
        // Nenhum botão é adicionado, desabilitando-os efetivamente.
    } else {
        // Lógica para status 'ativo' ou 'pausado'
        // Mantemos o cálculo apenas para logs ou lógica interna, mas o visual usará o Discord Tag
        if (!session.is_paused) {
            elapsedTimeMs -= session.total_paused_ms;
        } else {
            const lastPause = new Date(session.last_pause_time);
            const currentPauseDuration = Date.now() - lastPause.getTime();
            elapsedTimeMs -= (session.total_paused_ms + currentPauseDuration);
        }

        embed
            .setColor(session.is_paused ? '#E67E22' : '#2ECC71')
            .setTitle('Dashboard de Serviço')
            .addFields(
                { name: 'Status', value: session.is_paused ? '⏸️ Pausado' : '▶️ Em Serviço' },
                // [ALTERADO] 'f' para data fixa completa
                { name: 'Início do Serviço', value: `<t:${startUnix}:f>` }, 
                // [SOLUÇÃO] 'R' para Relativo (Contador que não trava)
                { name: 'Tempo Decorrido', value: `<t:${startUnix}:R>` } 
            );
        
        // Se houver pausas, adicionamos o tempo líquido calculado (opcional, mas bom para precisão)
        if (session.total_paused_ms > 0) {
            embed.addFields({ name: 'Tempo Líquido (Sem Pausas)', value: `\`${formatDuration(elapsedTimeMs)}\`` });
        }

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
        components.push(row);
    }

    return { embeds: [embed], components };
};