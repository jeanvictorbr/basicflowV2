// File: ui/automations/cloudflowVerifyShowcaseEmbed.js
const { V2_FLAG } = require('../../utils/constants.js');

/**
 * Gera o payload da mensagem de vitrine (V2).
 * Agora cria um botão de LINK direto para o sistema de Auth.
 * * @param {Object} config - Configurações da vitrine (title, description, footer, guild_id)
 */
function getCloudflowVerifyShowcaseEmbed(config) {
    // Configurações visuais (com valores padrão se faltar)
    const title = config?.title || "## 🛡️ Verificação Obrigatória";
    const description = config?.description || "> Para acessar os canais deste servidor, é necessário verificar sua conta clicando no botão abaixo.";
    const footer = config?.footer || "Sistema de Segurança CloudFlow • Seus dados estão protegidos.";
    
    // --- LÓGICA DO LINK INTELIGENTE ---
    // 1. Pega a URL do seu sistema de Auth do .env
    const authSystemUrl = process.env.AUTH_SYSTEM_URL; // Ex: https://jvverify.discloud.app
    
    // 2. Pega o ID do servidor (Passado pela função que chama este arquivo)
    const guildId = config?.guild_id;

    let buttonComponent;

    // Se o .env estiver certo e tivermos o ID da guilda, criamos o botão perfeito
    if (authSystemUrl && guildId) {
        buttonComponent = {
            "type": 2, // Componente Botão
            "style": 5, // Style 5 = Link (Cinza com setinha)
            "label": "Verificar Agora",
            "url": `${authSystemUrl}/login?guild_id=${guildId}`, // AQUI ESTÁ A MÁGICA
            "emoji": { "name": "🔐" }
        };
    } else {
        // Fallback de segurança: Se faltar configuração, mostra botão de erro para o admin ver
        buttonComponent = {
            "type": 2,
            "style": 4, // Style 4 = Vermelho
            "label": "Erro: URL não configurada",
            "custom_id": "error_config_missing",
            "disabled": true,
            "emoji": { "name": "⚠️" }
        };
    }

    // --- MONTAGEM DO PAYLOAD V2 (JSON Bruto) ---
    const v17_payload = {
        type: 17, // Tipo Mensagem Home/V2
        flags: V2_FLAG, // Flag Pública (se definido no constants) ou 0
        accent_color: 0x10B981, // Verde Esmeralda (Cor da barra lateral)
        components: [
            // Título
            { "type": 10, "content": title },
            
            // Descrição
            { "type": 10, "content": description },
            
            // Divisória
            { "type": 14, "divider": true, "spacing": 2 },
            
            // Rodapé
            { "type": 10, "content": `> ${footer}` },
            
            // Espaçamento Extra
            { "type": 14, "divider": true, "spacing": 2 },
            
            // Container do Botão
            {
                "type": 1, // Action Row
                "components": [ buttonComponent ]
            }
        ]
    };
    
    return v17_payload;
}

module.exports = { getCloudflowVerifyShowcaseEmbed };