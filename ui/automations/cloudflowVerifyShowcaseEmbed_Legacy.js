// File: ui/automations/cloudflowVerifyShowcaseEmbed_Legacy.js
// (ESTE ARQUIVO É NOVO)

// Esta função gera o payload "Legado" (embeds:[]) para ser usado QUANDO houver imagem.
function getCloudflowVerifyShowcaseEmbed_Legacy(config) {
    // Puxa as configurações
    const title = config?.title || "## 🛡️ Verificação CloudFlow";
    const description = config?.description || "> Para ter acesso completo aos canais deste servidor e confirmar sua identidade, clique no botão abaixo e autorize o Koda.";
    const footerText = config?.footer || "Sua verificação é segura e seus dados estão protegidos.";
    const imageUrl = config?.image || null; // Usado aqui

    // 1. Criamos um embed "legado"
    const embed = {
        // Embeds legados não suportam Markdown (##) no título.
        // Movemos o 'title' (que tinha markdown) para a 'description'.
        description: `${title}\n\n${description}`,
        color: 0x57F287, // Verde
        footer: {
            text: footerText
        }
    };

    // 2. A imagem DEVE ser uma propriedade 'image' dentro do embed
    if (imageUrl) {
        embed.image = {
            url: imageUrl
        };
    }

    // 3. Os botões (componentes) ficam fora do embed
    const components = [
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
    ];
    
    // 4. Retorna o payload padrão para channel.send()
    return {
        embeds: [embed],
        components: components
    };
}

module.exports = { getCloudflowVerifyShowcaseEmbed_Legacy };