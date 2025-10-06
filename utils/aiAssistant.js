// utils/aiAssistant.js
const { OpenAI } = require('openai');
require('dotenv').config();

// Verificação de segurança para a chave de API
if (!process.env.OPENAI_API_KEY) {
    throw new Error("A variável de ambiente OPENAI_API_KEY não está definida.");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord chamado BasicFlow. Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve, amigável e direto.`;

async function getAIResponse(userMessage, customPrompt) {
    try {
        const systemPrompt = customPrompt || defaultPrompt;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'gpt-3.5-turbo',
        });

        const response = completion.choices[0].message.content;
        return response.trim();
        
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error("[AI Assistant] Erro: A conta da OpenAI não tem créditos suficientes. Adicione saldo à sua conta para continuar a usar a IA.");
            return "O Assistente de IA está temporariamente indisponível por exceder a quota de utilização. A equipa de suporte irá ajudá-lo em breve.";
        }
        console.error("[AI Assistant] Erro ao gerar resposta da OpenAI:", error);
        return null;
    }
}

// Remova ou comente a função listAvailableModels se ainda existir
// async function listAvailableModels() { ... }

module.exports = { getAIResponse };