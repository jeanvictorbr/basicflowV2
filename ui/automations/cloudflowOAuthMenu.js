// File: ui/automations/cloudflowOAuthMenu.js
// CONTEÚDO COMPLETO E ATUALIZADO

const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getCloudflowOAuthMenu(guildSettings) {
    const oauthSecret = guildSettings?.cloudflow_oauth_secret;
    const hasSecret = !!oauthSecret;

    // Componentes V2 (Containers)
    const v2_components = [
        {
            "type": 10, // Text
            "content": "## 🔗 CloudFlow — Gerenciador OAuth2"
        },
        {
            "type": 10,
            "content": "> Permite que aplicações web externas verifiquem se um usuário é membro verificado deste servidor."
        },
        { "type": 14, "divider": true, "spacing": 1 }, // Divider
        {
            "type": 10,
            "content": `**Status:** ${hasSecret ? '🟢 Ativo' : '🔴 Inativo'}\n**Client Secret:** ${hasSecret ? `||${oauthSecret}||` : '`Nenhum definido.`'}`
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
            "type": 10,
            "content": "**Endpoint de Verificação:**\n`POST /api/v1/oauth/check`\n**Headers:** `Authorization: Bearer SEU_CLIENT_SECRET`\n**Body:** `{ \"user_id\": \"ID_DO_USUARIO\" }`"
        },
        { "type": 14, "divider": true, "spacing": 2 }, // Divider
        
        {
            "type": 1, // Action Row
            "components": [
                {
                    "type": 2, // Button
                    "style": 1, // Primary
                    "label": "Gerenciar Membros Verificados",
                    "custom_id": "aut_oauth_manage_members",
                    "emoji": { "name": "👥" }
                },
                {
                    "type": 2, // Button
                    "style": 2, // Secondary
                    "label": "Configurar Vitrine",
                    "custom_id": "aut_oauth_config_showcase",
                    "emoji": { "name": "🎨" }
                },
                // --- NOVO BOTÃO DE ADMIN ADICIONADO AQUI ---
                {
                    "type": 2, // Button
                    "style": 4, // Danger (Vermelho)
                    "label": "Admin Membros",
                    "custom_id": "aut_reg_open_oauth_hub",
                    "emoji": { "name": "🔒" }
                }
                // --- FIM DA ADIÇÃO ---
            ]
        },
        {
            "type": 1, // Action Row
            "components": [
                {
                    "type": 2, // Button
                    "style": 3, // Success
                    "label": hasSecret ? "Gerar Novo Secret" : "Ativar e Gerar Secret",
                    "custom_id": "aut_cf_oauth_start",
                    "emoji": { "name": "✨" }
                },
                {
                    "type": 2, // Button
                    "style": 2, // Secondary
                    "label": "Voltar",
                    "custom_id": "aut_open_cloudflow_menu",
                    "emoji": { "name": "⬅️" }
                }
            ]
        }
    ];

    return {
        type: 17, // V2 Message
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0x5865F2, // Blurple
        components: v2_components
    };
}

module.exports = { getCloudflowOAuthMenu };