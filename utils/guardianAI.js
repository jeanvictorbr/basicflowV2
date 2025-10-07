// utils/guardianAI.js
const { OpenAI } = require('openai');
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) { console.warn('[Guardian AI] OPENAI_API_KEY não definida.'); }
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Cache para sistema de regras (spam de usuário)
const messageCache = new Map();
// Caches para o novo sistema de detecção de conflito (por canal)
const channelMessageCache = new Map();
const channelAlertCooldowns = new Map();


async function analyzeToxicity(text) {
    const systemPrompt = `Avalie o nível de toxicidade da mensagem. Responda APENAS com um objeto JSON com a chave "toxicidade" e um valor de 0 a 100. Mensagem: "${text}"`;
    try {
        const completion = await openai.chat.completions.create({ model: 'gpt-3.5-turbo', messages: [{ role: 'system', content: systemPrompt }], response_format: { type: "json_object" } });
        const result = JSON.parse(completion.choices[0].message.content);
        return result.toxicidade || 0;
    } catch (error) { 
        console.error('[Guardian AI] Erro ao analisar toxicidade com OpenAI:', error);
        return 0; 
    }
}

/**
 * Analisa um trecho de conversa para detectar potencial conflito.
 * @param {string} conversation O texto formatado da conversa.
 * @returns {Promise<object|null>} Um objeto com as pontuações ou nulo em caso de erro.
 */
async function analyzeConflict(conversation) {
    const systemPrompt = `Você é um moderador de IA. Analise o seguinte trecho de uma conversa e avalie os níveis de "toxicidade", "sarcasmo" e "ataque_pessoal" em uma escala de 0 a 100. Responda APENAS com um objeto JSON contendo essas três chaves.

Conversa:
${conversation}`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: "json_object" }
        });
        const result = JSON.parse(completion.choices[0].message.content);
        return {
            toxicidade: result.toxicidade || 0,
            sarcasmo: result.sarcasmo || 0,
            ataque_pessoal: result.ataque_pessoal || 0,
        };
    } catch (error) {
        console.error('[Guardian AI] Erro ao analisar conflito com OpenAI:', error);
        return null;
    }
}

/**
 * Processa a detecção de conflito para uma mensagem recebida.
 * @param {import('discord.js').Message} message O objeto da mensagem.
 * @param {object} settings As configurações da guilda.
 */
async function processConflictDetection(message, settings) {
    if (!settings.guardian_ai_alert_channel) return;
    if (channelAlertCooldowns.has(message.channel.id)) return;

    // 1. Atualiza o cache de mensagens do canal
    if (!channelMessageCache.has(message.channel.id)) {
        channelMessageCache.set(message.channel.id, []);
    }
    const channelMessages = channelMessageCache.get(message.channel.id);
    channelMessages.push({
        author: message.author.username.replace(/ /g, '_'), // Remove espaços para melhor formatação
        content: message.content
    });
    if (channelMessages.length > 8) channelMessages.shift(); // Mantém apenas as últimas 8 mensagens

    // 2. Verifica se há condições para análise (mínimo de mensagens e autores)
    const uniqueAuthors = new Set(channelMessages.map(m => m.author));
    if (channelMessages.length < 4 || uniqueAuthors.size < 2) {
        return;
    }

    // 3. Formata a conversa e envia para análise
    const conversationText = channelMessages.map(m => `${m.author}: ${m.content}`).join('\n');
    const analysis = await analyzeConflict(conversationText);

    if (!analysis) return;

    // 4. Verifica se os limiares de alerta foram atingidos
    const { toxicidade, sarcasmo, ataque_pessoal } = analysis;
    const shouldAlert = toxicidade > 70 || sarcasmo > 80 || ataque_pessoal > 75;

    if (shouldAlert) {
        const alertChannel = await message.guild.channels.fetch(settings.guardian_ai_alert_channel).catch(() => null);
        if (alertChannel) {
            const embed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🛡️ Guardian AI: Conflito Potencial Detectado')
                .addFields(
                    { name: 'Canal', value: `${message.channel}`, inline: false },
                    { name: 'Usuários Envolvidos', value: Array.from(uniqueAuthors).join(', '), inline: false },
                    {
                        name: 'Análise da IA',
                        value: `**Toxicidade:** \`${toxicidade}%\`\n**Sarcasmo:** \`${sarcasmo}%\`\n**Ataque Pessoal:** \`${ataque_pessoal}%\``,
                        inline: false
                    },
                    { name: 'Últimas Mensagens', value: `\`\`\`\n${conversationText.substring(0, 1000)}\n\`\`\``, inline: false }
                )
                .setTimestamp();

            await alertChannel.send({ embeds: [embed] });

            // 6. Ativa cooldown e limpa o cache para este canal, evitando spam de alertas
            channelMessageCache.delete(message.channel.id);
            channelAlertCooldowns.set(message.channel.id, true);
            setTimeout(() => channelAlertCooldowns.delete(message.channel.id), 5 * 60 * 1000); // Cooldown de 5 minutos
        }
    }
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
    // Se a lista de canais monitorados não estiver vazia E o canal atual não estiver na lista, encerra.
    if (monitoredChannels.length > 0 && !monitoredChannels.includes(message.channel.id)) return;
    // Se a lista de canais monitorados estiver vazia, o Guardian não monitora nenhum canal.
    if (monitoredChannels.length === 0) return;

    // --- NOVA LÓGICA DE DETECÇÃO DE CONFLITO ---
    try {
        await processConflictDetection(message, settings);
    } catch (err) {
        console.error('[Guardian AI] Erro na detecção de conflito:', err);
    }
    // --- FIM DA NOVA LÓGICA ---

    // --- LÓGICA EXISTENTE DE REGRAS E POLÍTICAS ---
    const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 AND is_enabled = true', [message.guild.id])).rows;
    if (policies.length === 0) return;

    const recentMessages = updateMessageCache(message);

    for (const policy of policies) {
        const infractionRes = await db.query('SELECT * FROM guardian_infractions WHERE guild_id = $1 AND user_id = $2 AND policy_id = $3', [message.guild.id, message.author.id, policy.id]);
        let infraction = infractionRes.rows[0];

        if (!infraction || (new Date() - new Date(infraction.last_infraction_at)) > (policy.reset_interval_hours * 60 * 60 * 1000)) {
            infraction = { infraction_count: 0 };
        }

        const nextStepLevel = infraction.infraction_count + 1;
        const step = (await db.query('SELECT * FROM guardian_policy_steps WHERE policy_id = $1 AND step_level = $2', [policy.id, nextStepLevel])).rows[0];
        
        if (!step) continue;

        let conditionMet = false;
        let reason = '';
        let messagesToDelete = [];

        switch (policy.trigger_type) {
            case 'TOXICITY':
                const toxicityScore = await analyzeToxicity(message.content);
                if (toxicityScore >= step.threshold) {
                    conditionMet = true;
                    reason = `Toxicidade (${toxicityScore}%) atingiu o Nível ${step.step_level}`;
                    messagesToDelete.push(message.id);
                }
                break;
            case 'SPAM_TEXT':
                const matchingMessages = recentMessages.filter(msg => msg.content.toLowerCase() === message.content.toLowerCase() && message.content.length > 0);
                if (matchingMessages.length >= step.threshold) {
                    conditionMet = true;
                    reason = `Repetição de mensagem (${matchingMessages.length} vezes) atingiu o Nível ${step.step_level}`;
                    messagesToDelete = matchingMessages.map(m => m.id);
                }
                break;
            case 'MENTION_SPAM':
                const mentionCount = message.mentions.users.size + message.mentions.roles.size;
                if (mentionCount >= step.threshold) {
                    conditionMet = true;
                    reason = `Spam de menções (${mentionCount} menções)`;
                    messagesToDelete.push(message.id);
                }
                break;
        }

        if (conditionMet) {
            await executeRuleActions(message, policy, step, reason, settings, messagesToDelete);
            await db.query(
                `INSERT INTO guardian_infractions (guild_id, user_id, policy_id, infraction_count, last_infraction_at)
                 VALUES ($1, $2, $3, 1, NOW())
                 ON CONFLICT (guild_id, user_id, policy_id)
                 DO UPDATE SET infraction_count = guardian_infractions.infraction_count + 1, last_infraction_at = NOW()`,
                [message.guild.id, message.author.id, policy.id]
            );

            if (policy.trigger_type === 'SPAM_TEXT') {
                messageCache.set(`${message.guild.id}-${message.author.id}`, []);
            }
            return;
        }
    }
}

async function executeRuleActions(message, policy, step, reason, settings, messageIdsToDelete) {
    const { member, guild, channel } = message;
    if (step.action_delete_message && messageIdsToDelete.length > 0) {
        await channel.bulkDelete(messageIdsToDelete, true).catch(() => {});
    }
    if (step.action_warn_publicly) {
        await channel.send(`🛡️ ${member}, sua atividade acionou uma regra de proteção automática (\`${policy.name} - Nível ${step.step_level}\`).`);
    }
    
    let punishmentDetails = 'Nenhuma';
    try {
        const duration = (step.action_punishment_duration_minutes || 0) * 60 * 1000;
        const punishmentReason = `Guardian AI: ${policy.name} (Nível ${step.step_level})`;
        switch (step.action_punishment) {
            case 'TIMEOUT':
                if (duration > 0) {
                    await member.timeout(duration, punishmentReason);
                    punishmentDetails = `Silenciado por ${step.action_punishment_duration_minutes} min.`;
                }
                break;
            case 'KICK': await member.kick(punishmentReason); punishmentDetails = 'Expulso'; break;
            case 'BAN': await member.ban({ reason: punishmentReason }); punishmentDetails = 'Banido'; break;
        }
    } catch (error) { console.error(`[Guardian AI] Falha ao aplicar punição:`, error); punishmentDetails = `Falha ao punir.`; }

    if (settings.guardian_ai_log_channel) {
        const logChannel = await guild.channels.fetch(settings.guardian_ai_log_channel).catch(() => null);
        if (logChannel) {
            const embed = new EmbedBuilder().setColor('DarkRed').setAuthor({ name: 'Guardian AI - Ação de Escalonamento' })
                .setDescription(`**Usuário:** ${member}\n**Política:** \`${policy.name}\`\n**Nível Atingido:** \`${step.step_level}\`\n**Motivo:** ${reason}\n**Punição:** ${punishmentDetails}`)
                .setFooter({ text: `ID do Usuário: ${member.id}` }).setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = { processMessageForGuardian };