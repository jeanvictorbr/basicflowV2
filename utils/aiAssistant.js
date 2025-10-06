// utils/aiAssistant.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord. Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve e direto.`;

async function getAIResponse(userMessage, customPrompt) {
    try {
        // MUDANÇA FINAL: Usando o modelo mais estável e compatível
        const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

        const prompt = customPrompt || defaultPrompt;
        const fullPrompt = `${prompt}\n\nAqui está a primeira mensagem do utilizador:\n"${userMessage}"`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("[AI Assistant] Erro ao gerar resposta:", error);
        return null;
    }
}

module.exports = { getAIResponse };