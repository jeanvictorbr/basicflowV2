// utils/guardianAI.js
const { OpenAI } = require('openai');
const db = require('../database.js');
const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

if (!process.env.OPENAI_API_KEY) { console.warn('[Guardian AI] OPENAI_API_KEY não definida.'); }
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const messageCache = new Map();

// ... (as funções analyzeToxicity e updateMessageCache permanecem as mesmas da versão anterior)

async function processMessageForGuardian(message) {
    const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [message.guild.id])).rows[0];
    if (!settings?.guardian_ai_enabled) return;

    const monitoredChannels = (settings.guardian_ai_monitored_channels || '').split(',').filter(Boolean);
    if (!monitoredChannels.includes(message.channel.id)) return;

    const policies = (await db.query('SELECT * FROM guardian_policies WHERE guild_id = $1 AND is_enabled = true', [message.guild.id])).rows;
    if (policies.length === 0) return;

    const recentMessages = updateMessageCache(message);

    for (const policy of policies) {
        // Pega a infração atual do usuário para esta política
        const infractionRes = await db.query('SELECT * FROM guardian_infractions WHERE guild_id = $1 AND user_id = $2 AND policy_id = $3', [message.guild.id, message.author.id, policy.id]);
        let infraction = infractionRes.rows[0];

        // Se não houver infração ou se a última foi há muito tempo, reseta
        if (!infraction || (new Date() - new Date(infraction.last_infraction_at)) > (policy.reset_interval_hours * 60 * 60 * 1000)) {
            infraction = { infraction_count: 0 };
        }

        // Determina o próximo passo a ser verificado
        const nextStepLevel = infraction.infraction_count + 1;
        const step = (await db.query('SELECT * FROM guardian_policy_steps WHERE policy_id = $1 AND step_level = $2', [policy.id, nextStepLevel])).rows[0];
        
        // Se não houver um próximo passo configurado, ignora
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
            // Adicionar outros casos como 'MENTION_SPAM' aqui se necessário
        }

        if (conditionMet) {
            await executeRuleActions(message, policy, step, reason, settings, messagesToDelete);

            // Atualiza ou insere o registro de infração do usuário
            await db.query(
                `INSERT INTO guardian_infractions (guild_id, user_id, policy_id, infraction_count, last_infraction_at)
                 VALUES ($1, $2, $3, 1, NOW())
                 ON CONFLICT (guild_id, user_id, policy_id)
                 DO UPDATE SET infraction_count = guardian_infractions.infraction_count + 1, last_infraction_at = NOW()`,
                [message.guild.id, message.author.id, policy.id]
            );

            // Limpa o cache para o gatilho de spam
            if (policy.trigger_type === 'SPAM_TEXT') {
                messageCache.set(`${message.guild.id}-${message.author.id}`, []);
            }
            return; // Para a verificação após a primeira política ser acionada
        }
    }
}

async function executeRuleActions(message, policy, step, reason, settings, messageIdsToDelete) {
    // Esta função agora recebe 'step' em vez de 'rule' para as ações
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
    } catch (error) { punishmentDetails = `Falha ao punir.`; }

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