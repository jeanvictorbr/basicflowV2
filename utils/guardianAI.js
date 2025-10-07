// utils/guardianAI.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
    console.warn('[Guardian AI] A variável de ambiente GEMINI_API_KEY não está definida. O módulo não funcionará.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

// Cache para armazenar conversas recentes e evitar spam de API
const conversationCache = new Map();

async function analyzeTextWithGemini(chatHistory) {
    const prompt = `
        Analise o sentimento e a intenção da última mensagem no contexto da conversa a seguir.
        Responda APENAS com um objeto JSON com as seguintes chaves: "toxicidade" (0-100), "sarcasmo" (0-100), "ataque_pessoal" (0-100).
        Seja rigoroso na sua análise.
        Conversa:
        ${chatHistory.map(m => `${m.author}: ${m.content}`).join('\n')}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Limpa o texto para extrair apenas o JSON
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1] || jsonMatch[2]);
        }
        return null;
    } catch (error) {
        console.error('[Guardian AI] Erro ao analisar texto com Gemini:', error);
        return null;
    }
}

async function processMessageForGuardian(message) {
    const guildId = message.guild.id;
    const channelId = message.channel.id;
    const authorId = message.author.id;

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    if (!settings?.guardian_ai_enabled) {
        conversationCache.delete(channelId); // Limpa o cache se o sistema for desativado
        return;
    }

    const monitoredChannels = settings.guardian_ai_monitored_channels?.split(',') || [];
    if (!monitoredChannels.includes(channelId)) return;

    // Inicializa o cache para o canal se não existir
    if (!conversationCache.has(channelId)) {
        conversationCache.set(channelId, []);
    }
    const channelCache = conversationCache.get(channelId);

    // Adiciona a nova mensagem e mantém o cache com as últimas 10 mensagens
    channelCache.push({ author: message.author.tag, content: message.content, timestamp: Date.now() });
    if (channelCache.length > 10) channelCache.shift();

    // Condição para acionar a análise: mais de 2 mensagens no canal
    if (channelCache.length < 3) return;

    const analysis = await analyzeTextWithGemini(channelCache);
    if (!analysis) return;

    const sensitivity = {
        toxicidade: settings.guardian_ai_custom_toxicity || 80,
        sarcasmo: settings.guardian_ai_custom_sarcasm || 70,
        ataque_pessoal: settings.guardian_ai_custom_attack || 90,
    };

    if (
        analysis.toxicidade > sensitivity.toxicidade ||
        analysis.sarcasmo > sensitivity.sarcasmo ||
        analysis.ataque_pessoal > sensitivity.ataque_pessoal
    ) {
        // CONFLITO DETECTADO!
        console.log(`[Guardian AI] Conflito potencial detectado no servidor ${guildId}.`);
        await triggerIntervention(message, settings, analysis, channelCache);
        conversationCache.delete(channelId); // Limpa o cache após uma intervenção
    }
}

async function triggerIntervention(message, settings, analysis, chatHistory) {
    const { guild, channel } = message;

    // 1. Alertar a Staff (sempre)
    if (settings.guardian_ai_alert_channel) {
        const alertChannel = await guild.channels.fetch(settings.guardian_ai_alert_channel).catch(() => null);
        if (alertChannel) {
            const usersInvolved = [...new Set(chatHistory.map(m => m.author))];
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('🛡️ Guardian AI: Conflito Potencial Detectado')
                .setURL(message.url)
                .addFields(
                    { name: 'Canal', value: `${channel}` },
                    { name: 'Usuários Envolvidos', value: usersInvolved.join(', ') },
                    { name: 'Análise da IA', value: `Toxicidade: \`${analysis.toxicidade}%\`\nSarcasmo: \`${analysis.sarcasmo}%\`\nAtaque Pessoal: \`${analysis.ataque_pessoal}%\`` },
                    { name: 'Últimas Mensagens', value: chatHistory.slice(-5).map(m => `**${m.author}:** ${m.content}`).join('\n').substring(0, 1024) }
                )
                .setTimestamp();
            await alertChannel.send({ embeds: [embed] });
        }
    }

    // 2. Intervir no chat público (se configurado)
    if (settings.action_type === 'AlertAndIntervene') {
        const defaultMessage = "Lembrete amigável do nosso Guardião: Vamos manter a conversa respeitosa e construtiva, pessoal. Foco nas ideias, não nos ataques. 🙂";
        const interventionMessage = settings.guardian_ai_intervention_message || defaultMessage;
        await channel.send(interventionMessage);
    }
}


module.exports = { processMessageForGuardian };