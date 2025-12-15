// ui/pontoDashboardPessoal.js
const { ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const { formatDuration } = require('../utils/formatDuration.js');

module.exports = function generatePontoDashboard(interaction, session, status = 'ativo') {
    const startTime = new Date(session.start_time);
    let currentDuration = 0;
    
    // Lógica de cálculo corrigida (TIMESTAMP)
    if (session.is_paused && session.last_pause_time) {
        // Se estiver pausado, a duração é: Hora da Pausa - Hora Início - Pausas Anteriores
        const pauseTime = new Date(session.last_pause_time);
        currentDuration = pauseTime.getTime() - startTime.getTime() - (Number(session.total_paused_ms) || 0);
    } else {
        // Se estiver ativo, a duração é: Agora - Hora Início - Pausas Totais
        currentDuration = Date.now() - startTime.getTime() - (Number(session.total_paused_ms) || 0);
    }

    // Proteção para não mostrar negativo
    if (currentDuration < 0) currentDuration = 0;

    const embed = new EmbedBuilder()
        .setColor(session.is_paused ? '#F1C40F' : '#2ECC71') // Amarelo se pausado, Verde se ativo
        .setTitle(session.is_paused ? '⏸️ Serviço Pausado' : '✅ Serviço em Andamento')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
            { name: '👤 Usuário', value: `<@${session.user_id}>`, inline: true },
            { name: '⏳ Tempo Total', value: `\`${formatDuration(currentDuration)}\``, inline: true },
            { name: '📅 Início', value: `<t:${Math.floor(startTime.getTime() / 1000)}:f>`, inline: false }
        )
        .setFooter({ text: 'Sistema de Ponto • BasicFlow', iconURL: interaction.client.user.displayAvatarURL() })
        .setTimestamp();

    if (session.is_paused) {
        embed.setDescription(`**Status:** O tempo está congelado desde <t:${Math.floor(new Date(session.last_pause_time).getTime() / 1000)}:R>. Clique em "Retomar" para continuar.`);
    }

    // Botões
    const row = new ActionRowBuilder();

    if (status === 'finalizado') {
        embed.setTitle('⏹️ Serviço Finalizado').setColor('#E74C3C');
        // Não adiciona botões se finalizado
    } else {
        if (session.is_paused) {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('ponto_resume_service')
                    .setLabel('Retomar Serviço')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('▶️'),
                new ButtonBuilder()
                    .setCustomId('ponto_end_service')
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️') // <--- CORREÇÃO AQUI (Estava 'DQ')
            );
        } else {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('ponto_pause_service')
                    .setLabel('Pausar')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('⏸️'),
                new ButtonBuilder()
                    .setCustomId('ponto_end_service')
                    .setLabel('Finalizar')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('⏹️')
            );
        }
    }

    // Retorna payload compatível com reply/edit
    return { 
        embeds: [embed], 
        components: status === 'finalizado' ? [] : [row],
        content: '' // Limpa conteúdo antigo se houver
    };
};