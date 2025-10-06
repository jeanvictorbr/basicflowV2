// utils/aiAssistant.js
const { OpenAI } = require('openai');
require('dotenv').config();

// Inicializa o cliente da OpenAI com a sua chave de API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const defaultPrompt = `Você é um assistente de suporte para um servidor do Discord. Seu nome é BasicFlow. Seu objetivo é dar uma primeira resposta útil e amigável ao utilizador que abriu o ticket. Analise a mensagem do utilizador e, se for uma pergunta comum, tente respondê-la. Se for um problema complexo, peça mais detalhes específicos (como ID no jogo, screenshots, vídeos) para que a equipa humana possa resolver mais rápido. Seja breve, amigável e direto.`;

async function getAIResponse(userMessage, customPrompt) {
    try {
        const systemPrompt = customPrompt || defaultPrompt;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'gpt-3.5-turbo', // Modelo rápido e eficiente para esta tarefa
        });

        const response = completion.choices[0].message.content;
        return response;
        
    } catch (error) {
        // Trata erros comuns de API Key inválida
        if (error.response && error.response.status === 401) {
            console.error("[AI Assistant] Erro: A chave da API da OpenAI é inválida ou expirou.");
            return "Ocorreu um problema com a minha configuração interna. A equipa de suporte já foi notificada.";
        }
        console.error("[AI Assistant] Erro ao gerar resposta da OpenAI:", error);
        return null;
    }
}

module.exports = { getAIResponse };