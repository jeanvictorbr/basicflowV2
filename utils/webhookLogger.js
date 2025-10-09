// Crie em: utils/webhookLogger.js
const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

async function logAiUsage(logData) {
    if (!process.env.DEV_LOG_WEBHOOK_URL) return;

    const { guild, user, featureName, usage, cost } = logData;

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
        console.error('[Webhook Logger] Falha ao enviar log de uso da IA:', error);
    }
}

module.exports = { logAiUsage };