const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getOAuthHubMenu(settings) {
    const authSystemUrl = process.env.AUTH_SYSTEM_URL;
    const isConnected = !!authSystemUrl;
    const apiStatus = isConnected ? '🟢 Online' : '🔴 Offline (.env)';

    // Vitrine Status
    const roleId = settings.cloudflow_verify_role_id;
    const channelId = settings.cloudflow_verify_channel_id;
    const showcaseStatus = roleId && channelId ? '🟢 Ativa' : '🟡 Pendente';

    const v2_components = [
        { "type": 10, "content": "## 🛡️ Dashboard de Autenticação (OAuth2)" },
        { "type": 10, "content": `> **Status da API:** ${apiStatus} | **Porta:** 8080` },
        { "type": 14, "divider": true, "spacing": 2 },

        // Linha Principal: Gerenciar e Configurar
        {
            "type": 9,
            "accessory": { "type": 2, "style": 1, "label": "Gerenciar Membros", "emoji": { "name": "👥" }, "custom_id": "aut_oauth_manage_members" },
            "components": [
                { "type": 10, "content": "### 👥 Banco de Membros" },
                { "type": 10, "content": "> Visualize e transfira membros verificados que pertencem a este servidor." }
            ]
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
            "type": 9,
            "accessory": { "type": 2, "style": 2, "label": "Configurar Vitrine", "emoji": { "name": "🎨" }, "custom_id": "aut_oauth_config_showcase" },
            "components": [
                { "type": 10, "content": "### 🎨 Vitrine de Verificação" },
                { "type": 10, "content": `> Crie a mensagem pública onde os membros clicam para se verificar.\n> **Estado:** ${showcaseStatus}` }
            ]
        },
        { "type": 14, "divider": true, "spacing": 2 },
        {
            "type": 1, "components": [
                { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "⬅️" }, "custom_id": "aut_reg_back_to_registros" }
            ]
        }
    ];

    return {
        type: 17,
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0x2B2D31,
        components: v2_components
    };
}

module.exports = { getOAuthHubMenu };