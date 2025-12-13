// ui/pontoDashboardPessoalV2.js
const { formatDuration } = require('../utils/formatDuration.js');

module.exports = function generatePontoDashboardV2(interaction, settings, session, status = 'active') {
    const startTime = new Date(session.start_time);
    let elapsedTimeMs;
    let dashboardText = '';
    const defaultImage = 'https://media.discordapp.net/attachments/1310610658844475404/1424391049648017571/E99EBFA9-97D6-42F2-922C-6AC4EEC1651A.png?ex=68e46fca&is=68e31e4a&hm=167f4d74e96a1250138270ac9396faec3eb7ed427afb3490510b4f969b4f1a1f&=&format=webp&quality=lossless';
    const vitrineImage = settings.ponto_imagem_vitrine || defaultImage;

    const components = [];

    if (status === 'finalizado') {
        elapsedTimeMs = session.durationMs;
        dashboardText = `> **Status:** ⏹️ **Finalizado**\n> **Tempo Total de Serviço:** \`${formatDuration(elapsedTimeMs)}\``;
    } else {
        elapsedTimeMs = Date.now() - startTime.getTime();
        elapsedTimeMs -= (session.total_paused_ms || 0);
        if (session.is_paused) {
            const lastPause = new Date(session.last_pause_time);
            elapsedTimeMs -= (Date.now() - lastPause.getTime());
        }

        dashboardText = `> **Status:** ${session.is_paused ? '⏸️ Pausado' : '▶️ Em Serviço'}\n`;
        dashboardText += `> **Início:** <t:${Math.floor(startTime.getTime() / 1000)}:R>\n`;
        dashboardText += `> **Tempo Decorrido:** \`${formatDuration(elapsedTimeMs)}\`\n\n`;
        dashboardText += `> **Cargo Ativo:** <@&${settings.ponto_cargo_em_servico}>\n`;
        dashboardText += `> **Dashboard:** \`V2 Ativado ✨\`\n`;

        if (settings.ponto_afk_check_enabled) {
            dashboardText += `\n**__Sistema de Verificação de Atividade__**\n`;
            dashboardText += `> **Status:** \`Ligado\` | **Intervalo:** \`${settings.ponto_afk_check_interval_minutes} min\`\n`;
            dashboardText += `> *O bot enviará uma verificação em sua DM para confirmar sua atividade.*`;
        }

        const pauseResumeButton = { "type": 2, "style": session.is_paused ? 3 : 2, "label": session.is_paused ? "Retomar" : "Pausar", "emoji": { "name": session.is_paused ? "▶️" : "⏸️" }, "custom_id": session.is_paused ? "ponto_resume_service" : "ponto_pause_service" };
        const mainButtons = {
            "type": 1,
            "components": [
                pauseResumeButton,
                { "type": 2, "style": 4, "label": "Finalizar", "emoji": { "name": "⏹️" }, "custom_id": "ponto_end_service" },
                { "type": 2, "style": 2, "label": "Meu Status", "emoji": { "name": "📊" }, "custom_id": "ponto_meu_status" }
            ]
        };
        components.push(mainButtons);
    }
    
    return [{
        "type": 17, "accent_color": 16711680,
        "components": [
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 9, "components": [{ "type": 10, "content": "## Dashboard Pessoal de Serviço" }], "accessory": { "type": 11, "media": { "url": interaction.user.displayAvatarURL() } } },
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 10, "content": dashboardText },
            { "type": 14, "divider": true, "spacing": 1 },
            { "type": 12, "items": [{ "media": { "url": vitrineImage } }] },
            ...components
        ]
    }];
};