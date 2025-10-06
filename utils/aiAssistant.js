// utils/aiAssistant.js
require('dotenv').config();

const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const hfToken = process.env.HF_TOKEN;

// Verificação de segurança para o token
if (!hfToken) {
    throw new Error("A variável de ambiente HF_TOKEN não está definida.");
}

const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord chamado BasicFlow. Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve, amigável e direto.`;

async function getAIResponse(userMessage, customPrompt) {
    try {
        const systemPrompt = customPrompt || defaultPrompt;
        // Formato específico para modelos de instrução como o Mistral
        const formattedPrompt = `<s>[INST] ${systemPrompt} [/INST]</s>\n[INST] ${userMessage} [/INST]`;

        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${hfToken}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
                "inputs": formattedPrompt,
                "parameters": {
                    "max_new_tokens": 250, // Limita o tamanho da resposta
                    "return_full_text": false, // Retorna apenas a resposta da IA, não o prompt
                }
            }),
        });

        if (!response.ok) {
            const errorBody = await response.json();
            // Erro comum quando o modelo está a "acordar"
            if (errorBody.error && errorBody.estimated_time) {
                console.warn(`[AI Assistant] Modelo está a carregar. A tentar novamente em ${errorBody.estimated_time} segundos.`);
                return `🤖 O assistente de IA está a iniciar, por favor aguarde um momento...`;
            }
            throw new Error(`Erro da API Hugging Face: ${response.statusText} - ${JSON.stringify(errorBody)}`);
        }

        const result = await response.json();
        return result[0].generated_text;

    } catch (error) {
        console.error("[AI Assistant] Erro ao gerar resposta da Hugging Face:", error);
        return null;
    }
}

module.exports = { getAIResponse };