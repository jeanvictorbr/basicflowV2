// Substitua o conteúdo em: utils/webhookLogger.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const db = require('../database.js'); // Importa o banco de dados

async function logAiUsage(logData) {
    const { guild, user, featureName, usage, cost } = logData;

    // 1. Salva no banco de dados
    try {
        await db.query(
            `INSERT INTO ai_usage_logs (guild_id, user_id, feature_name, prompt_tokens, completion_tokens, total_tokens, cost)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [guild.id, user.id, featureName, usage.prompt_tokens, usage.completion_tokens, usage.total_tokens, cost]
        );
    } catch (dbError) {
        console.error('[Webhook Logger] Falha ao salvar log de uso da IA no banco de dados:', dbError);
    }

    // 2. Envia para o Webhook (se configurado)
    if (!process.env.DEV_LOG_WEBHOOK_URL) return;

    const embed = new EmbedBuilder()
        .setTitle(`🤖 Uso de IA Registrado: ${featureName}`)
        .setColor('Blue')
        .setTimestamp()
        .addFields(
            { name: 'Servidor', value: `> ${guild.name}\n> \`${guild.id}\``, inline: true },
            { name: 'Usuário', value: `> ${user.tag}\n> \`${user.id}\``, inline: true },
            { name: 'Custo da Requisição', value: `> **$${cost.toFixed(8)}** USD`, inline: true },
            { name: 'Tokens de Input', value: `\`${usage.prompt_tokens}\``, inline: true },
            { name: 'Tokens de Output', value: `\`${usage.completion_tokens}\``, inline: true },
            { name: 'Total de Tokens', value: `\`${usage.total_tokens}\``, inline: true }
        );

    try {
        await fetch(process.env.DEV_LOG_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed.toJSON()] }),
        });
    } catch (error) {
        console.error('[Webhook Logger] Falha ao enviar log de uso da IA para o webhook:', error);
    }
}

module.exports = { logAiUsage };