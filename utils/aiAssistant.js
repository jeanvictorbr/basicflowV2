// utils/aiAssistant.js
require('dotenv').config();

const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
const hfToken = process.env.HF_TOKEN;

if (!hfToken) {
    throw new Error("A variável de ambiente HF_TOKEN não está definida.");
}

const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord chamado BasicFlow. Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve, amigável e direto.`;

async function getAIResponse(userMessage, customPrompt) {
    try {
        const systemPrompt = customPrompt || defaultPrompt;
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
                    "max_new_tokens": 250,
                    "return_full_text": false,
                }
            }),
        });

        // LÓGICA DE TRATAMENTO DE ERROS ROBUSTA
        const responseBody = await response.text(); // Primeiro, obtemos a resposta como texto

        if (!response.ok) {
            console.error(`[AI Assistant] A API da Hugging Face retornou um erro ${response.status}.`);
            console.error(`[AI Assistant] Corpo da Resposta:`, responseBody);
            // Tenta interpretar o erro, se for JSON
            try {
                const errorJson = JSON.parse(responseBody);
                if (errorJson.error && errorJson.estimated_time) {
                    return `🤖 O assistente de IA está a iniciar, por favor aguarde um momento...`;
                }
            } catch (e) {
                // Se não for JSON, o erro já foi logado.
            }
            return null; // Retorna nulo para evitar enviar uma mensagem de erro ao utilizador
        }
        
        try {
            const result = JSON.parse(responseBody); // Agora, tentamos interpretar como JSON
            return result[0].generated_text.trim();
        } catch (e) {
            console.error("[AI Assistant] A resposta da API não era um JSON válido:", responseBody);
            return null;
        }

    } catch (error) {
        console.error("[AI Assistant] Erro crítico na função getAIResponse:", error);
        return null;
    }
}

module.exports = { getAIResponse };