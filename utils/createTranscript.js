const fs = require('fs');
const axios = require('axios');

// Função auxiliar segura para converter imagens
async function imageToBase64(url) {
    if (!url) return '';
    try {
        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            timeout: 5000 // Timeout de 5s para não travar o bot
        });
        const buffer = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'];
        return `data:${mimeType};base64,${buffer}`;
    } catch (error) {
        // Log simplificado para não sujar o console
        // console.warn(`[Transcript] Imagem não pôde ser carregada (provavelmente link expirado): ${url}`); 
        return '';
    }
}

async function createTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });
    const reversedMessages = Array.from(messages.values()).reverse();
    
    // CORREÇÃO: Usa o ícone do servidor dinamicamente em vez de link fixo que expira
    const logoUrl = channel.guild.iconURL({ extension: 'png', size: 128, forceStatic: false });
    const logoBase64 = await imageToBase64(logoUrl);

    const messagePromises = reversedMessages.map(async msg => {
        let author = msg.author;
        let avatarUrl = author.displayAvatarURL({ extension: 'png', size: 64, forceStatic: false });
        let content = msg.content;
        let isRelayed = false;

        // Tratamento para Webhooks e Embeds de Relay
        if (author.bot && msg.embeds.length > 0 && msg.embeds[0]?.author) {
            const embedAuthor = msg.embeds[0].author;
            author = { username: embedAuthor.name, tag: embedAuthor.name };
            // Verifica se o iconURL existe antes de tentar usar
            if (embedAuthor.iconURL) {
                avatarUrl = embedAuthor.iconURL;
            }
            content = msg.embeds[0].description || content; // Fallback para content se desc for nula
            isRelayed = true;
        }

        const attachmentsHtml = (await Promise.all(Array.from(msg.attachments.values()).map(async att => {
            if (att.contentType?.startsWith('image/')) {
                const imageBase64 = await imageToBase64(att.url);
                if (!imageBase64) return ''; // Se falhar, não mostra imagem quebrada
                return `<a href="${att.url}" target="_blank"><img class="attachment-image" src="${imageBase64}" alt="Anexo"></a>`;
            }
            return `<div class="attachment-file"><a href="${att.url}" target="_blank" download>${att.name}</a></div>`;
        }))).join('');

        const embedsHtml = msg.embeds.map(embed => {
            if (isRelayed) return '';
            const fieldsHtml = (embed.fields || []).map(field => 
                `<div class="embed-field">
                    <strong>${field.name}</strong>
                    <div>${field.value ? field.value.replace(/\n/g, '<br>') : ''}</div>
                </div>`
            ).join('');
            
            return `
            <div class="embed" ${embed.hexColor ? `style="border-left-color: ${embed.hexColor}"` : ''}>
                ${embed.author ? `<div class="embed-author">${embed.author.iconURL ? `<img src="${embed.author.iconURL}" class="embed-author-icon">` : ''}${embed.author.name}</div>` : ''}
                ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
                ${embed.description ? `<div>${embed.description.replace(/\n/g, '<br>')}</div>` : ''}
                ${fieldsHtml ? `<div class="embed-fields">${fieldsHtml}</div>` : ''}
                ${embed.image ? `<div class="embed-image"><img src="${embed.image.url}" style="max-width: 100%; border-radius: 4px; margin-top: 10px;"></div>` : ''}
            </div>`;
        }).join('');

        const avatarBase64 = await imageToBase64(avatarUrl);

        return `
            <div class="message-group">
                <img class="avatar" src="${avatarBase64 || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="${author.tag}">
                <div class="message-content">
                    <div class="author-info">
                        <span class="username">${author.username}</span>
                        <span class="timestamp">${new Date(msg.createdTimestamp).toLocaleString('pt-BR')}</span>
                    </div>
                    ${content ? `<div class="message-text">${content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, '<br>')}</div>` : ''}
                    ${attachmentsHtml ? `<div class="attachments">${attachmentsHtml}</div>` : ''}
                    ${embedsHtml}
                </div>
            </div>
        `;
    });

    const messageElements = await Promise.all(messagePromises);

    const html = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8"><title>Transcrição: #${channel.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body { font-family: 'Roboto', sans-serif; background-color: #23272A; color: #DCDDDE; margin: 0; padding: 24px; }
            .container { max-width: 900px; margin: auto; background-color: #2C2F33; border-radius: 12px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
            .header { display: flex; align-items: center; gap: 20px; border-bottom: 2px solid #40444B; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #7289DA; }
            .header-info h1 { margin: 0; font-size: 26px; color: #FFFFFF; font-weight: 700; }
            .header-info p { margin: 4px 0 0; font-size: 14px; color: #99AAB5; }
            .message-group { display: flex; padding: 16px 0; border-bottom: 1px solid #3a3e43; }
            .message-group:last-child { border-bottom: none; }
            .avatar { width: 48px; height: 48px; border-radius: 50%; margin-right: 16px; object-fit: cover; }
            .message-content { flex-grow: 1; overflow-wrap: anywhere; }
            .author-info { display: flex; align-items: baseline; margin-bottom: 6px; }
            .username { font-weight: 500; color: #FFFFFF; font-size: 17px; }
            .timestamp { font-size: 12px; color: #72767D; margin-left: 10px; }
            .message-text { font-size: 16px; line-height: 1.5; white-space: pre-wrap; word-wrap: break-word; }
            .attachments { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; }
            .attachment-image { max-width: 400px; max-height: 400px; height: auto; border-radius: 8px; }
            .attachment-file a { color: #7289DA; text-decoration: none; background-color: #40444B; padding: 8px 12px; border-radius: 5px; font-size: 14px; }
            .embed { background-color: #292B2F; border-left: 4px solid #4F545C; padding: 12px; border-radius: 5px; margin-top: 8px; max-width: 600px; }
            .embed-title { font-weight: 700; color: #FFFFFF; margin-bottom: 4px; }
            .embed-author { display: flex; align-items: center; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
            .embed-author-icon { width: 24px; height: 24px; border-radius: 50%; margin-right: 8px; }
            .embed-fields { margin-top: 10px; display: grid; gap: 8px; }
            .embed-field strong { color: #FFFFFF; }
            .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #40444B; font-size: 12px; color: #99AAB5; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                ${logoBase64 ? `<img class="logo" src="${logoBase64}" alt="Logo">` : ''}
                <div class="header-info">
                    <h1>Transcrição de Atendimento</h1>
                    <p>Servidor: ${channel.guild.name} | Canal: #${channel.name}</p>
                </div>
            </div>
            ${messageElements.join('')}
            <div class="footer"><p>Gerado automaticamente por ${channel.client.user.username} • ${new Date().toLocaleString('pt-BR')}</p></div>
        </div>
    </body>
    </html>
    `;

    return Buffer.from(html, 'utf-8');
}

module.exports = createTranscript;