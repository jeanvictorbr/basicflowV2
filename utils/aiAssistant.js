// Substitua o conteúdo em: utils/aiAssistant.js
const { OpenAI } = require('openai');
const { searchKnowledge } = require('./aiKnowledgeBase.js');
const db = require('../database.js');
const { logAiUsage } = require('./webhookLogger.js');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const INPUT_PRICE_PER_MILLION = 0.50;
const OUTPUT_PRICE_PER_MILLION = 1.50;

const defaultPrompt = `Você é um assistente de IA amigável e eficiente chamado "Assistente BasicFlow". Você foi integrado a um bot para Discord...`;

async function getAIResponse(options) {
    const { guild, user, featureName, chatHistory, userMessage, customPrompt, useBaseKnowledge } = options;

    try {
        // --- LÓGICA DE MANUTENÇÃO ATUALIZADA ---
        const botStatusResult = await db.query("SELECT ai_services_enabled, maintenance_message FROM bot_status WHERE status_key = 'main'");
        const botStatus = botStatusResult.rows[0];
        
        if (!botStatus?.ai_services_enabled) {
            const defaultMaintenanceMsg = "Os serviços de IA estão temporariamente em manutenção pelo desenvolvedor. Por favor, tente novamente mais tarde.";
            return botStatus.maintenance_message || defaultMaintenanceMsg;
        }
        // --- FIM DA ATUALIZAÇÃO ---

        const guildSettingsResult = await db.query("SELECT ai_services_disabled_by_dev FROM guild_settings WHERE guild_id = $1", [guild.id]);
        if (guildSettingsResult.rows[0]?.ai_services_disabled_by_dev) {
            return "Os serviços de IA foram desativados para este servidor pelo desenvolvedor.";
        }

        const retrievedKnowledge = await searchKnowledge(guild.id, userMessage, useBaseKnowledge);
        
        let systemPrompt = customPrompt || defaultPrompt;
        if (retrievedKnowledge) {
            systemPrompt += `\n\n--- INFORMAÇÕES RELEVANTES ENCONTRADAS ---\n${retrievedKnowledge}\n--- FIM DAS INFORMAÇÕES ---`;
        }

        const messages = [{ role: 'system', content: systemPrompt }, ...chatHistory];

        const completion = await openai.chat.completions.create({
            messages: messages,
            model: 'gpt-3.5-turbo',
        });

        const response = completion.choices[0].message.content;
        const usage = completion.usage;

        if (usage) {
            const inputCost = (usage.prompt_tokens / 1000000) * INPUT_PRICE_PER_MILLION;
            const outputCost = (usage.completion_tokens / 1000000) * OUTPUT_PRICE_PER_MILLION;
            const totalCost = inputCost + outputCost;

            await logAiUsage({ guild, user, featureName, usage, cost: totalCost });
        }

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