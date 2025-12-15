const { formatDuration } = require('../utils/formatDuration.js');

module.exports = function generatePontoDashboardV2(interaction, settings, session, status = 'ativo') {
    const startTime = new Date(session.start_time);
    let currentDuration = 0;

    // --- CORREÇÃO AQUI ---
    if (session.is_paused && session.last_pause_time) {
        // Congela o tempo na hora da pausa
        const pauseTime = new Date(session.last_pause_time);
        currentDuration = pauseTime.getTime() - startTime.getTime() - (Number(session.total_paused_ms) || 0);
    } else {
        // Tempo correndo
        currentDuration = Date.now() - startTime.getTime() - (Number(session.total_paused_ms) || 0);
    }
    if (currentDuration < 0) currentDuration = 0;
    // ---------------------

    const isPaused = session.is_paused;
    const formattedDuration = formatDuration(currentDuration);
    
    // Define cores e textos baseados no estado
    const color = status === 'finalizado' ? 15158332 : (isPaused ? 15844367 : 3066993); // Vermelho, Amarelo, Verde
    const statusText = status === 'finalizado' ? "Serviço Finalizado" : (isPaused ? "Serviço Pausado" : "Em Serviço");
    const statusEmoji = status === 'finalizado' ? "⏹️" : (isPaused ? "⏸️" : "✅");

    const components = [
        {
            type: 10,
            content: `## ${statusEmoji} Painel de Ponto - ${interaction.member.displayName}`
        },
        {
            type: 10,
            content: `> **Tempo Decorrido:** \`${formattedDuration}\`\n> **Início:** <t:${Math.floor(startTime.getTime() / 1000)}:f>`
        }
    ];

    if (isPaused && status !== 'finalizado') {
        components.push({
            type: 10,
            content: `⚠️ **PAUSADO:** O contador está parado. Clique em **Retomar** para continuar contando.`
        });
    }

    // Botões (Action Row)
    if (status !== 'finalizado') {
        const buttons = [];
        
        if (isPaused) {
            buttons.push({
                type: 2,
                style: 3, // Success (Green)
                label: "Retomar",
                emoji: { name: "▶️" },
                custom_id: "ponto_resume_service"
            });
        } else {
            buttons.push({
                type: 2,
                style: 2, // Secondary (Grey)
                label: "Pausar",
                emoji: { name: "⏸️" },
                custom_id: "ponto_pause_service"
            });
        }

        buttons.push({
            type: 2,
            style: 4, // Danger (Red)
            label: "Finalizar",
            emoji: { name: "⏹️" },
            custom_id: "ponto_end_service"
        });

        components.push({
            type: 1,
            components: buttons
        });
    }

    return components;
};