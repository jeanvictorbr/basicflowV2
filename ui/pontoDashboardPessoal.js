const { calculateSessionTime } = require('../utils/pontoUtils.js'); // <--- CORRIGIDO AQUI

module.exports = function generatePontoDashboard(interaction, session, status = 'ativo') {
    const timeData = calculateSessionTime(session);
    
    let color = 0x2ECC71; // Verde (Ativo)
    let title = '✅ Serviço em Andamento';
    let desc = "";

    if (session.is_paused) {
        color = 0xF1C40F; // Amarelo (Pausado)
        title = '⏸️ Serviço Pausado';
        desc = `**Status:** O tempo está congelado desde <t:${Math.floor(parseInt(session.last_pause_time) / 1000)}:R>. Clique em "Retomar" para continuar.`;
    }

    if (status === 'finalizado') {
        color = 0xE74C3C; // Vermelho (Finalizado)
        title = '⏹️ Serviço Finalizado';
        desc = `**Expediente encerrado.**\nTempo total registrado: \`${timeData.formatted}\``;
    }

    const embed = {
        title: title,
        description: desc,
        color: color,
        thumbnail: { url: interaction.user.displayAvatarURL() },
        fields: [
            { name: '👤 Usuário', value: `<@${session.user_id}>`, inline: true },
            { name: '⏳ Tempo Total', value: `\`${timeData.formatted}\``, inline: true },
            { name: '📅 Início', value: `<t:${Math.floor(parseInt(session.start_time) / 1000)}:f>`, inline: false }
        ],
        footer: { text: 'Sistema de Ponto • Koda', icon_url: interaction.client.user.displayAvatarURL() },
        timestamp: new Date().toISOString()
    };

    const components = [];

    if (status !== 'finalizado') {
        const buttons = [];
        
        if (session.is_paused) {
            buttons.push({
                type: 2, style: 3, label: 'Retomar Serviço', custom_id: 'ponto_resume_service', emoji: { name: '▶️' }
            });
        } else {
            buttons.push({
                type: 2, style: 2, label: 'Pausar', custom_id: 'ponto_pause_service', emoji: { name: '⏸️' }
            });
        }

        buttons.push({
            type: 2, style: 4, label: 'Finalizar', custom_id: 'ponto_end_service', emoji: { name: '⏹️' }
        });

        buttons.push({
            type: 2, style: 1, label: 'Meu Status', custom_id: 'ponto_meu_status', emoji: { name: '🔄' }
        });

        components.push({ type: 1, components: buttons });
    }

    return {
        content: "",
        embeds: [embed],
        components: components,
        flags: 1 << 6
    };
};