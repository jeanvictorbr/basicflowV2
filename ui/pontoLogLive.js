const { calculateSessionTime } = require('../utils/pontoUtils.js');

module.exports = (session, user) => {
    const timeData = calculateSessionTime(session);
    
    // Configurações visuais baseadas no estado
    let color = 0x2ECC71; // Verde (Ativo)
    let statusTitle = "🟢 Em Serviço";
    let footerText = "Sessão Ativa • Atualizado em tempo real";

    if (session.status === 'CLOSED') {
        color = 0xE74C3C; // Vermelho (Finalizado)
        statusTitle = "🔴 Finalizado";
        footerText = `Sessão Encerrada • ID: ${session.session_id}`;
    } else if (session.is_paused) {
        color = 0xF1C40F; // Amarelo (Pausado)
        statusTitle = "⏸️ Pausado";
        footerText = "Sessão em Pausa";
    }

    const embed = {
        title: `📑 Registro de Ponto: ${user.displayName || user.username}`,
        color: color,
        thumbnail: { url: user.displayAvatarURL() },
        fields: [
            {
                name: "👤 Staff",
                value: `<@${session.user_id}> \`(${session.user_id})\``,
                inline: true
            },
            {
                name: "📡 Status Atual",
                value: `**${statusTitle}**`,
                inline: true
            },
            {
                name: "⏱️ Tempo Líquido",
                value: `\`${timeData.formatted}\``,
                inline: true
            },
            {
                name: "📅 Início",
                value: `<t:${timeData.startTimestamp}:f>`,
                inline: true
            }
        ],
        footer: { text: footerText },
        timestamp: new Date().toISOString()
    };

    // Se estiver finalizado, mostra a hora do fim
    if (session.status === 'CLOSED' && session.end_time) {
        const endTimeMs = new Date(session.end_time).getTime();
        embed.fields.push({
            name: "🏁 Fim do Expediente",
            value: `<t:${Math.floor(endTimeMs / 1000)}:f>`,
            inline: true
        });
    }

    return { embeds: [embed], components: [] }; // Sem botões no log, apenas visualização
};