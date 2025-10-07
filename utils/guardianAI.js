// utils/guardianAI.js
const { OpenAI } = require('openai');
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) { console.warn('[Guardian AI] OPENAI_API_KEY não definida.'); }
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const messageCache = new Map(); // Cache para detectar spam e repetições

async function analyzeToxicity(text) {
    const systemPrompt = `Avalie o nível de toxicidade, ataque pessoal e linguagem de ódio no seguinte texto. Responda APENAS com um objeto JSON com a chave "toxicidade" e um valor de 0 a 100. Texto: "${text}"`;
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'system', content: systemPrompt }],
            response_format: { type: "json_object" },
        });
        const result = JSON.parse(completion.choices[0].message.content);
        return result.toxicidade || 0;
    } catch (error) {
        console.error('[Guardian AI] Erro ao analisar toxicidade com OpenAI:', error);
        return 0;
    }
}

function updateMessageCache(message) {
    const { author, guild, content } = message;
    const key = `${guild.id}-${author.id}`;
    const now = Date.now();

    if (!messageCache.has(key)) {
        messageCache.set(key, []);
    }
    const userMessages = messageCache.get(key);

    // Adiciona a mensagem atual com timestamp
    userMessages.push({ timestamp: now, content });

    // Limpa mensagens mais antigas que 60 segundos
    const filteredMessages = userMessages.filter(msg => now - msg.timestamp < 60000);
    messageCache.set(key, filteredMessages);

    return filteredMessages;
}

async function processMessageForGuardian(message) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
    if (!settings?.guardian_ai_enabled) return;

    const rules = (await db.query('SELECT * FROM guardian_rules WHERE guild_id = $1 AND is_enabled = true', [message.guild.id])).rows;
    if (rules.length === 0) return;

    const recentMessages = updateMessageCache(message);

    for (const rule of rules) {
        let conditionMet = false;
        let reason = '';

        switch (rule.trigger_type) {
            case 'TOXICITY':
                const toxicityScore = await analyzeToxicity(message.content);
                if (toxicityScore >= rule.trigger_threshold) {
                    conditionMet = true;
                    reason = `Toxicidade detectada (${toxicityScore}%) excede o limiar de ${rule.trigger_threshold}%`;
                }
                break;
            
            case 'SPAM_TEXT':
                const matchingMessages = recentMessages.filter(msg => msg.content === message.content);
                if (matchingMessages.length >= rule.trigger_threshold) {
                    conditionMet = true;
                    reason = `Repetição de mensagem detectada (${matchingMessages.length} vezes)`;
                    // Limpa o cache para este usuário para evitar múltiplos acionamentos
                    messageCache.set(`${message.guild.id}-${message.author.id}`, []);
                }
                break;
            
            case 'MENTION_SPAM':
                const mentionCount = message.mentions.users.size + message.mentions.roles.size;
                if (mentionCount >= rule.trigger_threshold) {
                    conditionMet = true;
                    reason = `Spam de menções detectado (${mentionCount} menções)`;
                }
                break;
        }

        if (conditionMet) {
            await executeRuleActions(message, rule, reason, settings);
            // Para a verificação após a primeira regra ser acionada para evitar punições múltiplas
            return; 
        }
    }
}

async function executeRuleActions(message, rule, reason, settings) {
    console.log(`[Guardian AI] Regra "${rule.name}" acionada por ${message.author.tag}. Motivo: ${reason}`);
    const { member, guild } = message;

    // Ação 1: Deletar a mensagem
    if (rule.action_delete_message && message.deletable) {
        await message.delete().catch(err => console.error("[Guardian AI] Falha ao deletar mensagem:", err));
    }

    // Ação 2: Enviar aviso na DM
    if (rule.action_warn_member_dm) {
        await member.send(`**Aviso do Guardian AI no servidor ${guild.name}:**\nSua atividade recente acionou a regra de proteção automática: "${rule.name}".\n**Motivo:** ${reason}.\n\nPor favor, revise as regras do servidor.`).catch(() => {});
    }
    
    // Ação 3: Aplicar Punição
    let punishmentDetails = 'Nenhuma punição aplicada.';
    try {
        switch (rule.action_punishment) {
            case 'TIMEOUT_5_MIN':
                await member.timeout(5 * 60 * 1000, `Guardian AI: ${rule.name}`);
                punishmentDetails = 'Silenciado por 5 minutos.';
                break;
            case 'TIMEOUT_30_MIN':
                await member.timeout(30 * 60 * 1000, `Guardian AI: ${rule.name}`);
                punishmentDetails = 'Silenciado por 30 minutos.';
                break;
            case 'KICK':
                await member.kick(`Guardian AI: ${rule.name}`);
                punishmentDetails = 'Expulso do servidor.';
                break;
        }
    } catch (error) {
        console.error(`[Guardian AI] Falha ao aplicar punição (${rule.action_punishment}):`, error);
        punishmentDetails = `Falha ao aplicar punição (Verifique minhas permissões).`;
    }


    // Ação 4: Enviar Log para a Staff
    if (settings.guardian_ai_log_channel) {
        const logChannel = await guild.channels.fetch(settings.guardian_ai_log_channel).catch(() => null);
        if (logChannel) {
            const embed = new EmbedBuilder()
                .setColor('DarkRed')
                .setAuthor({ name: 'Guardian AI - Ação Automática', iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`**Usuário:** ${member} (${member.user.tag})\n**Regra Acionada:** \`${rule.name}\`\n**Motivo:** ${reason}\n**Punição Aplicada:** ${punishmentDetails}`)
                .addFields({ name: 'Mensagem Original', value: `\`\`\`${message.content.substring(0, 1000)}\`\`\`` })
                .setFooter({ text: `ID do Usuário: ${member.id}` })
                .setTimestamp();
            await logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = { processMessageForGuardian };