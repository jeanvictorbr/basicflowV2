// ui/devPanel/devAiProviderMenu.js
const { ButtonStyle } = require('discord.js');

module.exports = function generateDevAiProviderMenu(botStatus) {
    const activeProvider = botStatus?.active_ai_provider || 'openai';
    const providerStatus = `> Atualmente, o bot está utilizando a API da **${activeProvider.toUpperCase()}**.`;

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 🤖 Gerenciador de Provedor de IA" },
                { "type": 10, "content": "> Alterne entre os serviços de IA disponíveis para o bot. A troca é instantânea." },
                { "type": 14, "divider": true, "spacing": 1 },
                { "type": 10, "content": providerStatus },
                { "type": 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": ButtonStyle.Secondary, "label": "Usar OpenAI (GPT-3.5)", "custom_id": "dev_set_ai_provider_openai", "disabled": activeProvider === 'openai' },
                        { "type": 2, "style": ButtonStyle.Secondary, "label": "Usar Google (Gemini)", "custom_id": "dev_set_ai_provider_gemini", "disabled": activeProvider === 'gemini' },
                        // --- NOVO BOTÃO ADICIONADO AQUI ---
                        { "type": 2, "style": ButtonStyle.Secondary, "label": "Usar Groq (Llama 3)", "custom_id": "dev_set_ai_provider_groq", "disabled": activeProvider === 'groq' }
                    ]
                },
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": 2, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "devpanel" }
                    ]
                }
            ]
        }
    ];
};