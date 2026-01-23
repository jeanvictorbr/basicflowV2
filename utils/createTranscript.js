// File: utils/createTranscript.js
const { Collection } = require('discord.js');

async function createTranscript(channel, guild) {
    // 1. Validação inicial do canal
    if (!channel || !channel.name) {
        console.error('[Transcript] Canal inválido ou indefinido.');
        return null; 
    }

    try {
        let messages = new Collection();
        let lastId;
        
        // Fetch seguro
        while (true) {
            const options = { limit: 100 };
            if (lastId) options.before = lastId;

            const fetched = await channel.messages.fetch(options).catch(() => new Collection());
            if (fetched.size === 0) break;

            fetched.forEach(msg => messages.set(msg.id, msg));
            lastId = fetched.last().id;

            if (messages.size >= 500) break; // Limite de 500 para segurança
            await new Promise(r => setTimeout(r, 1000));
        }

        const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

        let html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Transcript: ${channel.name}</title>
            <style>
                body { background-color: #36393f; color: #dcddde; font-family: sans-serif; padding: 20px; }
                .message-group { margin-bottom: 20px; border-bottom: 1px solid #4f545c; padding-bottom: 10px; }
                .author { font-weight: bold; color: #fff; margin-right: 5px; }
                .timestamp { color: #72767d; font-size: 0.8em; }
                .content { margin-top: 5px; white-space: pre-wrap; word-wrap: break-word; }
                .attachment { margin-top: 10px; display: block; color: #00b0f4; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>Ticket: ${channel.name}</h1>
            <h3>Servidor: ${guild ? guild.name : 'Servidor Desconhecido'}</h3>
            <hr>
        `;

        for (const msg of sortedMessages) {
            const authorName = msg.author ? (msg.author.tag || 'Usuário') : 'Desconhecido';
            const content = msg.content ? msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
            const date = msg.createdAt ? msg.createdAt.toLocaleString() : '';

            html += `<div class="message-group">
                <div><span class="author">${authorName}</span> <span class="timestamp">${date}</span></div>
                <div class="content">${content || '*(Anexo ou Embed)*'}</div>`;

            // Tratamento Seguro de Anexos (Aqui estava o erro)
            if (msg.attachments && msg.attachments.size > 0) {
                msg.attachments.forEach(att => {
                    const safeName = att.name ? att.name : 'arquivo_sem_nome';
                    const safeUrl = att.url ? att.url : '#';
                    html += `<a href="${safeUrl}" target="_blank" class="attachment">📎 ${safeName}</a>`;
                });
            }

            html += `</div>`;
        }

        html += `</body></html>`;

        return Buffer.from(html, 'utf-8');

    } catch (error) {
        console.error('[Transcript] Erro interno:', error);
        return null;
    }
}

module.exports = createTranscript;