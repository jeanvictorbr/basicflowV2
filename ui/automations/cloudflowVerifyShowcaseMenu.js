// File: ui/automations/cloudflowVerifyShowcaseMenu.js
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/constants.js');

function getCloudflowVerifyShowcaseMenu(settings) {
    
    // Pega as configurações salvas ou usa os pré-enchidos
    const config = settings.cloudflow_verify_config || {};
    const title = config.title || "## 🛡️ Verificação CloudFlow";
    const description = config.description || "> Para ter acesso completo aos canais deste servidor e confirmar sua identidade, clique no botão abaixo e autorize o BasicFlow.";
    const footer = config.footer || "Sua verificação é segura e seus dados estão protegidos.";
    const image = config.image || "`Nenhuma`";
    
    const roleId = settings.cloudflow_verify_role_id;
    const roleText = roleId ? `<@&${roleId}> (\`${roleId}\`)` : "`Nenhum cargo definido`";
    
    const channelId = settings.cloudflow_verify_channel_id;
    const messageId = settings.cloudflow_verify_message_id;
    const publishStatus = channelId && messageId ? `🟢 Publicado em <#${channelId}>` : "🔴 Não publicado";

    const v2_components = [
        { "type": 10, "content": "## 🎨 Configurar Vitrine de Verificação" },
        { "type": 10, "content": "> Configure a aparência e as ações da sua vitrine de verificação OAuth." },
        { "type": 14, "divider": true, "spacing": 2 },

        // Preview da Configuração
        { "type": 10, "content": `**Título:**\n${title}` },
        { "type": 10, "content": `**Descrição:**\n${description}` },
        { "type": 10, "content": `**Rodapé:**\n> ${footer}` },
        { "type": 10, "content": `**Imagem URL:**\n${image}` },
        { "type": 14, "divider": true, "spacing": 1 },
        { "type": 10, "content": `**Cargo a ser entregue:**\n${roleText}` },
        { "type": 14, "divider": true, "spacing": 2 },
        { "type": 10, "content": `**Status:** ${publishStatus}` },
        { "type": 14, "divider": true, "spacing": 2 },

        // Botões de Ação
        {
            "type": 1, // Action Row
            "components": [
                { "type": 2, "style": 2, "label": "Título", "custom_id": "aut_showcase_set_title" },
                { "type": 2, "style": 2, "label": "Descrição", "custom_id": "aut_showcase_set_desc" },
                { "type": 2, "style": 2, "label": "Rodapé", "custom_id": "aut_showcase_set_footer" },
                { "type": 2, "style": 2, "label": "Imagem", "custom_id": "aut_showcase_set_image", disabled: true },
            ]
        },
        {
            "type": 1, // Action Row
            "components": [
                { "type": 2, "style": 1, "label": "Definir Cargo", "custom_id": "aut_showcase_set_role", "emoji": { "name": "🏷️" } },
                { "type": 2, "style": 3, "label": "Publicar / Mover", "custom_id": "aut_showcase_publish", "emoji": { "name": "🚀" } },
            ]
        },
        {
            "type": 1, // Action Row
            "components": [
                { "type": 2, "style": 2, "label": "Voltar", "custom_id": "aut_showcase_back_to_oauth", "emoji": { "name": "⬅️" } }
            ]
        }
    ];

    return {
        type: 17,
        flags: V2_FLAG | EPHEMERAL_FLAG,
        accent_color: 0xFAA61A, // Laranja
        components: v2_components
    };
}

module.exports = { getCloudflowVerifyShowcaseMenu };