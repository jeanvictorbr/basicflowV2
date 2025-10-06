// utils/aiAssistant.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI;
if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
}

const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord. Seu nome é BasicFlow. Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve, amigável e direto.`;

async function getAIResponse(userMessage, customPrompt) {
    if (!genAI) {
        console.error("[AI Assistant] Cliente da IA não inicializado. Verifique a GEMINI_API_KEY.");
        return null;
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const prompt = customPrompt || defaultPrompt;
        const fullPrompt = `${prompt}\n\nAqui está a primeira mensagem do utilizador:\n"${userMessage}"`;
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("[AI Assistant] Erro ao gerar resposta da Google AI:", error);
        return null;
    }
}

// NOVA FUNÇÃO DE DIAGNÓSTICO
async function listAvailableModels() {
    if (!apiKey) {
        return { apiKeyExists: false, models: [], error: null };
    }
    try {
        const { models } = await genAI.listModels();
        return { apiKeyExists: true, models, error: null };
    } catch (error) {
        return { apiKeyExists: true, models: [], error: error.message };
    }
}

module.exports = { getAIResponse, listAvailableModels };