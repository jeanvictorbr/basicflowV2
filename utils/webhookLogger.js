// Substitua o conteúdo em: utils/webhookLogger.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const db = require('../database.js'); // Importa o banco de dados DIRETAMENTE

/**
 * Loga um evento genérico no banco de dados.
 * @param {string} guildId ID da Guild
 * @param {string} eventName Nome do Evento (ex: "Anúncio Publicado")
 * @param {string} details Detalhes do evento
 * @param {object} payload Objeto contendo dados extras (user, module, type)
 */
async function logEvent(guildId, eventName, details, payload = {}) {
    try {
        // Usa o 'db' importado no topo do arquivo
        await db.query(
            `INSERT INTO interaction_logs (guild_id, user_id, type, name, module, timestamp)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [
                guildId,
                payload.user || 'BOT_SYSTEM',
                payload.type || 'SYSTEM',
                eventName,
                payload.module || 'UNKNOWN',
            ]
        );
    } catch (dbError) {
        console.error(`[Webhook Logger] Falha ao salvar log de evento (${eventName}) no banco de dados:`, dbError);
    }
}

async function logAiUsage(logData) {
    const { guild, user, featureName, usage, cost, promptText, responseText } = logData;

    // 1. Salva no banco de dados (usando o db importado)
    try {
        await db.query(
            `INSERT INTO ai_usage_logs (guild_id, user_id, feature_name, prompt_tokens, completion_tokens, total_tokens, cost, prompt_text, response_text)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [guild.id, user.id, featureName, usage.prompt_tokens, usage.completion_tokens, usage.total_tokens, cost, promptText, responseText]
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

// EXPORTAÇÃO CORRIGIDA
module.exports = { logAiUsage, logEvent };