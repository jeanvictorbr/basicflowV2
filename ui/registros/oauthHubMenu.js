// File: ui/registros/oauthHubMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getOAuthHubMenu(settings) {

    // Verifica o status do 'Secret'
    const oauthSecret = settings?.cloudflow_oauth_secret;
    const hasSecret = !!oauthSecret;
    
    // Verifica o status da 'Vitrine'
    const roleId = settings.cloudflow_verify_role_id;
    const channelId = settings.cloudflow_verify_channel_id;
    const messageId = settings.cloudflow_verify_message_id;
    const showcaseStatus = roleId && channelId && messageId ? '🟢 Ativa' : '🟡 Incompleta';

    const v2_components = [
        { "type": 10, "content": "## 🔗 Verificação via OAuth (CloudFlow)" },
        { "type": 10, "content": "> Este é o método de verificação mais **robusto e confiável**. Ele vincula a conta Discord do membro ao seu sistema, permitindo que você (Admin) transfira membros entre servidores e recupere o acesso deles caso o percam." },
        { "type": 14, "divider": true, "spacing": 2 },

        {
            "type": 9, "accessory": { "type": 2, "style": 1, "label": "Gerenciar", "emoji": { "name": "👥" }, "custom_id": "aut_oauth_manage_members" },
            "components": [
                { "type": 10, "content": "### Gerenciador de Membros" },
                { "type": 10, "content": "> Veja, remova, bana ou transfira membros que já se verificaram." }
            ]
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
            "type": 9, "accessory": { "type": 2, "style": 1, "label": "Configurar", "emoji": { "name": "🎨" }, "custom_id": "aut_oauth_config_showcase" },
            "components": [
                { "type": 10, "content": "### Vitrine de Verificação" },
                { "type": 10, "content": `> Configure a aparência da mensagem pública e o cargo que será entregue.\n> **Status da Vitrine:** ${showcaseStatus}` }
            ]
        },
        { "type": 14, "divider": true, "spacing": 1 },
        {
            "type": 9, "accessory": { "type": 2, "style": hasSecret ? 2 : 3, "label": hasSecret ? "Gerar Novo" : "Ativar API", "emoji": { "name": "✨" }, "custom_id": "aut_cf_oauth_start" },
            "components": [
                { "type": 10, "content": "### API Secret (Client Secret)" },
                { "type": 10, "content": `> A senha para seu site/painel externo se comunicar com o bot.\n> **Status da API:** ${hasSecret ? '🟢 Ativo' : '🔴 Inativo'}` }
            ]
        },
        { "type": 14, "divider": true, "spacing": 2 },
        
        // Botão Voltar (para o menu de Registros)
        {
            "type": 1, "components": [
                { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "⬅️" }, "custom_id": "aut_reg_back_to_registros" }
            ]
        }
    ];

    return {
        type: 17,
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0x5865F2, // Blurple
        components: v2_components
    };
}

module.exports = { getOAuthHubMenu };