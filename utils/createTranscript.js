// File: utils/createTranscript.js
// VERSÃO OTIMIZADA: Sem download de imagens (Anti-Flood)
const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

/**
 * Gera um arquivo HTML leve com o histórico do chat.
 * @param {import('discord.js').TextChannel} channel
 * @param {import('discord.js').Guild} guild
 */
async function createTranscript(channel, guild) {
    try {
        let messages = new Collection();
        let lastId;
        
        // --- 1. Fetch de Mensagens com "Freio" (Anti-Rate Limit) ---
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;

            const fetched = await channel.messages.fetch(options);
            if (fetched.size === 0) break;

            fetched.forEach(msg => messages.set(msg.id, msg));
            lastId = fetched.last().id;

            // Limite de segurança: se passar de 1000 mensagens, para (evita crash de memória)
            if (messages.size >= 1000) break; 
            
            // Pausa de 1 segundo entre requisições para não flodar a API
            await new Promise(r => setTimeout(r, 1000));
        }

        // Ordena mensagens da mais antiga para a mais nova
        const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        // --- 2. Construção do HTML (Sem baixar imagens) ---
        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transcript: ${channel.name}</title>
            <style>
                body { background-color: #36393f; color: #dcddde; font-family: sans-serif; padding: 20px; }
                .message-group { margin-bottom: 20px; border-bottom: 1px solid #4f545c; padding-bottom: 10px; }
                .author { font-weight: bold; color: #fff; margin-right: 5px; }
                .timestamp { color: #72767d; font-size: 0.8em; }
                .content { margin-top: 5px; white-space: pre-wrap; word-wrap: break-word; }
                .attachment { margin-top: 10px; display: block; color: #00b0f4; text-decoration: none; }
                .embed { border-left: 4px solid #202225; padding-left: 10px; margin-top: 5px; background: #2f3136; padding: 5px; border-radius: 4px; }
                img.preview { max-width: 300px; max-height: 300px; border-radius: 5px; margin-top: 5px; display: block; }
            </style>
        </head>
        <body>
            <h1>Ticket: ${channel.name}</h1>
            <h3>Servidor: ${guild.name}</h3>
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <hr>
        `;

        for (const msg of sortedMessages) {
            const authorName = msg.author ? msg.author.tag : 'Usuário Desconhecido';
            const date = msg.createdAt ? msg.createdAt.toLocaleString('pt-BR') : 'Data N/A';
            const content = msg.content ? msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';

            html += `<div class="message-group">
                <div>
                    <span class="author">${authorName}</span>
                    <span class="timestamp">${date}</span>
                </div>
                <div class="content">${content || '<em>(Conteúdo embed ou anexo)</em>'}</div>`;

            // Tratamento de Anexos (Apenas Link - NÃO BAIXA)
            if (msg.attachments.size > 0) {
                msg.attachments.forEach(att => {
                    const isImage = att.contentType && att.contentType.startsWith('image/');
                    if (isImage) {
                        // Usa o link direto do Discord. Não converte pra Base64.
                        html += `<a href="${att.url}" target="_blank"><img src="${att.url}" class="preview" alt="Anexo" onerror="this.style.display='none'"></a>`;
                    } else {
                        html += `<a href="${att.url}" target="_blank" class="attachment">📎 ${att.name}</a>`;
                    }
                });
            }

            // Tratamento Básico de Embeds
            if (msg.embeds.length > 0) {
                msg.embeds.forEach(embed => {
                    html += `<div class="embed">
                        <strong>${embed.title || 'Embed'}</strong><br>
                        ${embed.description || ''}
                    </div>`;
                });
            }

            html += `</div>`;
        }

        html += `</body></html>`;

        // Salva num buffer para envio
        return Buffer.from(html, 'utf-8');

    } catch (error) {
        console.error('[Transcript] Erro ao gerar:', error);
        return null; // Retorna nulo para o bot não crashar tentando enviar algo quebrado
    }
}

module.exports = createTranscript;