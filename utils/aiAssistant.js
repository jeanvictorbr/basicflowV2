// Substitua completamente o conteúdo em: utils/aiAssistant.js
const { OpenAI } = require('openai');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const { searchKnowledge } = require('./aiKnowledgeBase.js');
const db = require('../database.js');
const { logAiUsage } = require('./webhookLogger.js');
require('dotenv').config();

// Inicialização dos clientes
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
});

const defaultPrompt = `Você é um assistente de IA amigável e eficiente chamado "Assistente BasicFlow".`;

// --- FUNÇÕES ESPECÍFICAS PARA CADA PROVEDOR ---

async function getOpenAIResponse(messages) {
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: 'gpt-3.5-turbo',
    });
    return {
        response: completion.choices[0].message.content,
        usage: completion.usage
    };
}

// --- FUNÇÃO PARA O GROQ COM O MODELO CORRETO ---
async function getGroqResponse(messages) {
    const completion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.1-8b-instant', // CORREÇÃO FINAL: Usando o modelo Llama 3.1 mais recente e ativo.
    });
    return {
        response: completion.choices[0].message.content,
        usage: completion.usage
    };
}

async function getGeminiResponse(messages) {
    // Mantemos a função do Gemini aqui para o futuro.
    const systemInstruction = messages.find(m => m.role === 'system')?.content || defaultPrompt;
    const historyWithoutSystem = messages.filter(m => m.role !== 'system');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: { parts: [{ text: systemInstruction }] }, safetySettings: [ { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE }, { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE }, { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE }, { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }, ] });
    if (historyWithoutSystem.length === 0 && systemInstruction) { const result = await model.generateContent(systemInstruction); const text = result.response.text(); const usage = { prompt_tokens: (await model.countTokens(systemInstruction)).totalTokens, completion_tokens: (await model.countTokens(text)).totalTokens, total_tokens: (await model.countTokens(systemInstruction + text)).totalTokens }; return { response: text, usage }; }
    const lastMessage = historyWithoutSystem.pop();
    const history = historyWithoutSystem.map(msg => ({ role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] }));
    const chat = model.startChat({ history }); const result = await chat.sendMessage(lastMessage.content); const response = result.response; const text = response.text();
    const usage = { prompt_tokens: (await model.countTokens(JSON.stringify(messages))).totalTokens, completion_tokens: (await model.countTokens(text)).totalTokens, total_tokens: (await model.countTokens(JSON.stringify(messages) + text)).totalTokens };
    return { response: text, usage };
}

// --- FUNÇÃO PRINCIPAL ATUALIZADA ---
async function getAIResponse(options) {
    const { guild, user, featureName, chatHistory = [], userMessage, customPrompt, useBaseKnowledge } = options;
    try {
        const botStatusResult = await db.query("SELECT ai_services_enabled, maintenance_message, active_ai_provider FROM bot_status WHERE status_key = 'main'");
        const botStatus = botStatusResult.rows[0];

        if (!botStatus?.ai_services_enabled) { return botStatus.maintenance_message || "Os serviços de IA estão temporariamente em manutenção."; }
        
        const retrievedKnowledge = await searchKnowledge(guild.id, userMessage, useBaseKnowledge);
        let systemPrompt = customPrompt || defaultPrompt;
        if (retrievedKnowledge) { systemPrompt += `\n\n--- INFORMAÇÕES RELEVANTES ---\n${retrievedKnowledge}\n--- FIM ---`; }

        const formattedChatHistory = chatHistory.map(msg => ({ role: msg.role, content: msg.content || (msg.parts && msg.parts[0] ? msg.parts[0].text : ''), })).filter(Boolean);
        const messages = [{ role: 'system', content: systemPrompt }, ...formattedChatHistory];
        if (userMessage) messages.push({ role: 'user', content: userMessage });

        let result;
        const provider = botStatus.active_ai_provider;

        if (provider === 'gemini') {
            result = await getGeminiResponse(messages);
        } else if (provider === 'groq') {
            result = await getGroqResponse(messages);
        } else { // Padrão é OpenAI
            result = await getOpenAIResponse(messages);
        }

        if (result.usage) {
            let cost = 0;
            if (provider === 'openai') {
                const INPUT_PRICE_PER_MILLION = 0.50;
                const OUTPUT_PRICE_PER_MILLION = 1.50;
                cost = ((result.usage.prompt_tokens / 1000000) * INPUT_PRICE_PER_MILLION) + ((result.usage.completion_tokens / 1000000) * OUTPUT_PRICE_PER_MILLION);
            }
            // MODIFICAÇÃO AQUI: Passamos o prompt e a resposta para o logger
            await logAiUsage({
                guild, user, featureName, usage: result.usage, cost,
                promptText: JSON.stringify(messages, null, 2), // Salva o array de mensagens como texto
                responseText: result.response
            });
        }

        return result.response.trim();
    } catch (error) {
        const activeProvider = (await db.query("SELECT active_ai_provider FROM bot_status")).rows[0]?.active_ai_provider || 'desconhecido';
        console.error(`[AI Assistant] Erro com o provedor '${activeProvider}':`, error);
        return "Ocorreu um erro ao comunicar com o serviço de IA. O provedor pode estar offline ou a chave de API pode ser inválida.";
    }
}

module.exports = { getAIResponse };