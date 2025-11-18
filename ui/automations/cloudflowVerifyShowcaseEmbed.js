// File: ui/automations/cloudflowVerifyShowcaseEmbed.js
// (MODIFICADO para ser SEMPRE V2 e SEM imagem)

const { V2_FLAG } = require('../../utils/constants.js');

// Esta função agora gera APENAS o payload V2 (type: 17) SEM imagem.
function getCloudflowVerifyShowcaseEmbed(config) {
    // Puxa as configurações ou usa os pré-enchidos
    const title = config?.title || "## 🛡️ Verificação CloudFlow";
    const description = config?.description || "> Para ter acesso completo aos canais deste servidor e confirmar sua identidade, clique no botão abaixo e autorize o BasicFlow.";
    const footer = config?.footer || "Sua verificação é segura e seus dados estão protegidos.";
    // const imageUrl = config?.image || null; // Não é mais usado aqui

    // 1. ESTE É O PAYLOAD V17 (V2)
    const v17_payload = {
        type: 17,
        flags: V2_FLAG, // Flag pública
        accent_color: 0x57F287, // Verde
        components: [
            { "type": 10, "content": title },
            { "type": 10, "content": description },
            { "type": 14, "divider": true, "spacing": 2 },
            { "type": 10, "content": `> ${footer}` },
            { "type": 14, "divider": true, "spacing": 2 },
            {
                "type": 1, // Action Row
                "components": [
                    {
                        "type": 2, // Button
                        "style": 1, // Primary
                        "label": "Verificar Agora",
                        "custom_id": "cloudflow_start_verification", 
                        "emoji": { "name": "🔗" }
                    }
                ]
            }
        ]
        // A propriedade "image" NUNCA é adicionada aqui
    };
    
    return v17_payload;
}

module.exports = { getCloudflowVerifyShowcaseEmbed };