// utils/guardianAI.js
const { OpenAI } = require('openai');
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) { console.warn('[Guardian AI] OPENAI_API_KEY não definida.'); }
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const messageCache = new Map();

async function analyzeToxicity(text) {
    const systemPrompt = `Avalie o nível de toxicidade da mensagem. Responda APENAS com um objeto JSON com a chave "toxicidade" e um valor de 0 a 100. Mensagem: "${text}"`;
    try {
        const completion = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }], response_format: { type: "json_object" } });
        return JSON.parse(completion.choices[0].message.content).toxicidade || 0;
    } catch (error) { console.error('[Guardian AI] Erro ao analisar toxicidade:', error); return 0; }
}

function updateMessageCache(message) {
    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    if (!messageCache.has(key)) messageCache.set(key, []);
    const userMessages = messageCache.get(key);
    userMessages.push({ timestamp: now, content: message.content, id: message.id });
    const filteredMessages = userMessages.filter(msg => now - msg.timestamp < 30000); // Janela de 30s para spam
    messageCache.set(key, filteredMessages);
    return filteredMessages;
}

async function processMessageForGuardian(message) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
    if (!settings?.guardian_ai_enabled) return;

    const monitoredChannels = (settings.guardian_ai_monitored_channels || '').split(',').filter(Boolean);
    if (!monitoredChannels.includes(message.channel.id)) return;

    const rules = (await db.query('SELECT * FROM guardian_rules WHERE guild_id = $1 AND is_enabled = true', [message.guild.id])).rows;
    if (rules.length === 0) return;

    const recentMessages = updateMessageCache(message);

    for (const rule of rules) {
        let conditionMet = false, reason = '', messagesToDelete = [];

        switch (rule.trigger_type) {
            case 'TOXICITY':
                const toxicityScore = await analyzeToxicity(message.content);
                if (toxicityScore >= rule.trigger_threshold) {
                    conditionMet = true;
                    reason = `Toxicidade detectada (${toxicityScore}%)`;
                    messagesToDelete.push(message.id);
                }
                break;
            case 'SPAM_TEXT':
                const matchingMessages = recentMessages.filter(msg => msg.content.toLowerCase() === message.content.toLowerCase() && message.content.length > 0);
                if (matchingMessages.length >= rule.trigger_threshold) {
                    conditionMet = true;
                    reason = `Repetição de mensagem (${matchingMessages.length} vezes)`;
                    messagesToDelete = matchingMessages.map(m => m.id);
                    messageCache.set(`${message.guild.id}-${message.author.id}`, []);
                }
                break;
            case 'MENTION_SPAM':
                const mentionCount = message.mentions.users.size + message.mentions.roles.size;
                if (mentionCount >= rule.trigger_threshold) {
                    conditionMet = true;
                    reason = `Spam de menções (${mentionCount} menções)`;
                    messagesToDelete.push(message.id);
                }
                break;
        }
        if (conditionMet) {
            await executeRuleActions(message, rule, reason, settings, messagesToDelete);
            return;
        }
    }
}

async function executeRuleActions(message, rule, reason, settings, messageIdsToDelete) {
    const { member, guild, channel } = message;
    if (rule.action_delete_message && messageIdsToDelete.length > 0) {
        await channel.bulkDelete(messageIdsToDelete, true).catch(() => {});
    }
    if (rule.action_warn_publicly) {
        await channel.send(`🛡️ ${member}, sua atividade acionou uma regra de proteção automática (\`${rule.name}\`). Por favor, evite esta conduta.`);
    }
    let punishmentDetails = 'Nenhuma';
    try {
        const duration = (rule.action_punishment_duration_minutes || 0) * 60 * 1000;
        const punishmentReason = `Guardian AI: ${rule.name}`;
        switch (rule.action_punishment) {
            case 'TIMEOUT':
                if (duration > 0) {
                    await member.timeout(duration, punishmentReason);
                    punishmentDetails = `Silenciado por ${rule.action_punishment_duration_minutes} min.`;
                }
                break;
            case 'KICK': await member.kick(punishmentReason); punishmentDetails = 'Expulso'; break;
            case 'BAN': await member.ban({ reason: punishmentReason }); punishmentDetails = 'Banido'; break;
        }
    } catch (error) { console.error(`[Guardian AI] Falha ao aplicar punição:`, error); punishmentDetails = 'Falha ao punir.'; }

    if (settings.guardian_ai_log_channel) {
        const logChannel = await guild.channels.fetch(settings.guardian_ai_log_channel).catch(() => null);
        if (logChannel) {
            const embed = new EmbedBuilder().setColor('DarkRed').setAuthor({ name: 'Guardian AI - Ação Automática' })
                .setDescription(`**Usuário:** ${member}\n**Regra:** \`${rule.name}\`\n**Motivo:** ${reason}\n**Punição:** ${punishmentDetails}`)
                .setFooter({ text: `ID do Usuário: ${member.id}` }).setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = { processMessageForGuardian };