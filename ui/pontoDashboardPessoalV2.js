// Crie em: ui/pontoDashboardPessoalV2.js
const { formatDuration } = require('../utils/formatDuration.js');

module.exports = function generatePontoDashboardV2(interaction, settings, session, status = 'active') {
    const startTime = new Date(session.start_time);
    let elapsedTimeMs;
    let dashboardText = '';
    
    if (status === 'finalizado') {
        elapsedTimeMs = session.durationMs;
        dashboardText = `> **Status:** ⏹️ Finalizado\n> **Tempo Total de Serviço:** \`${formatDuration(elapsedTimeMs)}\``;
    } else {
        elapsedTimeMs = Date.now() - startTime.getTime();
        elapsedTimeMs -= (session.total_paused_ms || 0);
        if (session.is_paused) {
            const lastPause = new Date(session.last_pause_time);
            elapsedTimeMs -= (Date.now() - lastPause.getTime());
        }

        dashboardText = `> **Status:** ${session.is_paused ? '⏸️ Pausado' : '▶️ Em Serviço'}\n`;
        dashboardText += `> **Início:** <t:${Math.floor(startTime.getTime() / 1000)}:R>\n`;
        dashboardText += `> **Tempo Decorrido:** \`${formatDuration(elapsedTimeMs)}\`\n`;
        dashboardText += `> **Cargo Ativo:** <@&${settings.ponto_cargo_em_servico}>\n`;
        dashboardText += `> **Estilo do Dashboard:** \`V2 Ativado ✨\`\n`;

        if (settings.ponto_afk_check_enabled) {
            dashboardText += `\n**__Sistema de Verificação de Atividade__**\n`;
            dashboardText += `> **Status:** \`Ligado\` | **Intervalo:** A cada \`${settings.ponto_afk_check_interval_minutes}\` minutos.\n`;
            dashboardText += `> *O bot enviará uma verificação em sua DM. Você terá 15 minutos para responder.*`;
        }
    }

    const pauseResumeButton = {
        "type": 2,
        "style": session.is_paused ? 3 : 1, // Verde para Retomar, Azul para Pausar
        "label": session.is_paused ? "Retomar" : "Pausar",
        "emoji": { "name": session.is_paused ? "▶️" : "⏸️" },
        "custom_id": session.is_paused ? "ponto_resume_service" : "ponto_pause_service"
    };

    return [{
        "type": 17, "accent_color": 16711680, "spoiler": false,
        "components": [
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 9, "components": [{ "type": 10, "content": "## Dashboard Pessoal de Serviço" }, { "type": 10, "content": "Interaja com os botões abaixo para gerenciar seu ponto." }], "accessory": { "type": 11, "media": { "url": interaction.user.displayAvatarURL() } } },
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 10, "content": dashboardText },
            { "type": 14, "divider": true, "spacing": 1 },
            {
                "type": 1,
                "components": status === 'finalizado' ? [] : [
                    pauseResumeButton,
                    { "type": 2, "style": 4, "label": "Finalizar", "emoji": { "name": "⏹️" }, "custom_id": "ponto_end_service" },
                    { "type": 2, "style": 2, "label": "Atualizar", "emoji": { "name": "🔄" }, "custom_id": "ponto_refresh_dashboard" }
                ]
            }
        ]
    }];
};