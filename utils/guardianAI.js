// utils/guardianAI.js
const { OpenAI } = require('openai');
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

// Reutiliza a sua configuração existente da OpenAI
if (!process.env.OPENAI_API_KEY) {
    console.warn('[Guardian AI] A variável de ambiente OPENAI_API_KEY não está definida. O módulo não funcionará.');
}
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Cache para armazenar conversas recentes
const conversationCache = new Map();

async function analyzeTextWithOpenAI(chatHistory) {
    const systemPrompt = `
        Analise o sentimento e a intenção da última mensagem no contexto da conversa a seguir.
        Sua resposta DEVE ser APENAS um objeto JSON válido com as seguintes chaves e valores numéricos de 0 a 100:
        "toxicidade": (nível de linguagem odiosa ou agressiva),
        "sarcasmo": (nível de ironia ou provocação),
        "ataque_pessoal": (nível de ofensa direcionada a um usuário).

        Exemplo de resposta: {"toxicidade": 85, "sarcasmo": 40, "ataque_pessoal": 90}
    `;

    const messages = chatHistory.map(m => ({
        role: 'user', // Trata todas as mensagens como "user" para a análise de contexto
        content: `${m.author}: ${m.content}`
    }));

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            response_format: { type: "json_object" }, // Pede para a IA garantir um JSON válido
        });

        const result = JSON.parse(completion.choices[0].message.content);
        return result;

    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.error("[Guardian AI] Erro: A conta da OpenAI não tem créditos suficientes.");
        } else {
            console.error('[Guardian AI] Erro ao analisar texto com OpenAI:', error);
        }
        return null;
    }
}

async function processMessageForGuardian(message) {
    const guildId = message.guild.id;
    const channelId = message.channel.id;

    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    if (!settings?.guardian_ai_enabled) {
        conversationCache.delete(channelId);
        return;
    }

    const monitoredChannels = (settings.guardian_ai_monitored_channels || '').split(',').filter(Boolean);
    const ignoredChannels = (settings.guardian_ai_ignored_channels || '').split(',').filter(Boolean);

    if (!monitoredChannels.includes(channelId) || ignoredChannels.includes(channelId)) {
        return;
    }

    if (!conversationCache.has(channelId)) {
        conversationCache.set(channelId, []);
    }
    const channelCache = conversationCache.get(channelId);

    channelCache.push({ author: message.author.tag, content: message.content });
    if (channelCache.length > 8) channelCache.shift();

    if (channelCache.length < 3) return;

    // Aciona a análise apenas se houver troca de mensagens entre pelo menos 2 pessoas diferentes
    const authorsInCache = new Set(channelCache.map(m => m.author));
    if (authorsInCache.size < 2) return;

    const analysis = await analyzeTextWithOpenAI(channelCache);
    if (!analysis) return;

    // Define os limiares de sensibilidade (padrão ou customizado)
    const sensitivity = {
        toxicidade: settings.guardian_ai_custom_toxicity || 80,
        sarcasmo: settings.guardian_ai_custom_sarcasm || 70,
        ataque_pessoal: settings.guardian_ai_custom_attack || 90,
    };

    if (
        analysis.toxicidade >= sensitivity.toxicidade ||
        analysis.sarcasmo >= sensitivity.sarcasmo ||
        analysis.ataque_pessoal >= sensitivity.ataque_pessoal
    ) {
        console.log(`[Guardian AI] Conflito potencial detectado no servidor ${guildId}.`);
        await triggerIntervention(message, settings, analysis, channelCache);
        conversationCache.delete(channelId);
    }
}

async function triggerIntervention(message, settings, analysis, chatHistory) {
    const { guild, channel } = message;

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
                    { name: 'Análise da IA', value: `Toxicidade: \`${analysis.toxicidade || 0}%\`\nSarcasmo: \`${analysis.sarcasmo || 0}%\`\nAtaque Pessoal: \`${analysis.ataque_pessoal || 0}%\`` },
                    { name: 'Últimas Mensagens', value: "```" + chatHistory.slice(-5).map(m => `${m.author}: ${m.content}`).join('\n').substring(0, 1000) + "```" }
                )
                .setTimestamp();
            await alertChannel.send({ embeds: [embed] });
        }
    }

    if (settings.action_type === 'AlertAndIntervene') {
        const defaultMessage = "Lembrete amigável do nosso Guardião: Vamos manter a conversa respeitosa e construtiva, pessoal. Foco nas ideias, não nos ataques. 🙂";
        const interventionMessage = settings.guardian_ai_intervention_message || defaultMessage;
        await channel.send(interventionMessage);
    }
}

module.exports = { processMessageForGuardian };