// utils/aiAssistant.js
const { OpenAI } = require('openai');
const { searchKnowledge } = require('./aiKnowledgeBase.js');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) {
    throw new Error("A variável de ambiente OPENAI_API_KEY não está definida.");
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const defaultPrompt = `Você é um assistente de IA amigável e eficiente chamado "Assistente BasicFlow". Você foi integrado a um bot para Discord chamado BasicFlow, desenvolvido por "ze pqueno". A sua principal função é fornecer o primeiro nível de suporte aos utilizadores que abrem um ticket de ajuda neste servidor. Você deve manter uma conversa com o utilizador até que um membro da equipa humana intervenha. Baseie as suas respostas no conhecimento fornecido e no histórico da conversa.`;

async function getAIResponse(guildId, chatHistory, userMessage, customPrompt) {
    try {
        const retrievedKnowledge = await searchKnowledge(guildId, userMessage);
        
        let systemPrompt = customPrompt || defaultPrompt;
        if (retrievedKnowledge) {
            systemPrompt += `\n\n--- INFORMAÇÕES RELEVANTES ENCONTRADAS ---\n${retrievedKnowledge}\n--- FIM DAS INFORMAÇÕES ---`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory
        ];

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo',
        });

        const response = completion.choices[0].message.content;
        return response.trim();
        
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error("[AI Assistant] Erro: A conta da OpenAI não tem créditos suficientes.");
            return "O Assistente de IA está temporariamente indisponível por exceder a quota de utilização. A equipa de suporte irá ajudá-lo em breve.";
        }
        console.error("[AI Assistant] Erro ao gerar resposta da OpenAI:", error);
        return null;
    }
}

module.exports = { getAIResponse };