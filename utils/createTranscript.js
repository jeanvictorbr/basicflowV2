// Substitua COMPLETAMENTE o conteúdo do arquivo: utils/createTranscript.js

const fs = require('fs');
const axios = require('axios'); // Necessário para baixar as imagens

/**
 * Baixa uma imagem de uma URL e a converte para o formato Base64.
 * Isso permite embutir a imagem diretamente no arquivo HTML.
 * @param {string} url A URL da imagem.
 * @returns {Promise<string>} Uma string no formato Data URI (ex: data:image/png;base64,...).
 */
async function imageToBase64(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary').toString('base64');
        const mimeType = response.headers['content-type'];
        return `data:${mimeType};base64,${buffer}`;
    } catch (error) {
        console.error(`[Transcript] Falha ao converter imagem para Base64: ${url}`, error);
        // Retorna uma string vazia ou um placeholder se a imagem não puder ser carregada.
        return ''; 
    }
}


async function generateTranscript(channel) {
    const messages = await channel.messages.fetch({ limit: 100 });
    const reversedMessages = Array.from(messages.values()).reverse();

    const logoUrl = 'https://media.discordapp.net/attachments/1310610658844475404/1426758912224264344/Logotipo_Banda_de_Rock_Vermelho_e_Preto__1_-removebg-preview.png?ex=68edb5c8&is=68ec6448&hm=afb5a704942f5f9e106afc4a167c38dad72f94d16ceb63f7dba742c1ec629067&=&format=webp&quality=lossless';
    
    // Converte a logo para Base64
    const logoBase64 = await imageToBase64(logoUrl);

    // Mapeia e processa todas as mensagens de forma assíncrona
    const messagePromises = reversedMessages.map(async msg => {
        // Converte anexos de imagem para Base64
        const attachmentsHtml = (await Promise.all(Array.from(msg.attachments.values()).map(async att => {
            if (att.contentType?.startsWith('image/')) {
                const imageBase64 = await imageToBase64(att.url);
                return `<a href="${att.url}" target="_blank"><img class="attachment-image" src="${imageBase64}" alt="Anexo de Imagem" loading="lazy"></a>`;
            } else {
                return `<div class="attachment-file"><a href="${att.url}" target="_blank" download>${att.name}</a></div>`;
            }
        }))).join('<br>');

        const embedsHtml = msg.embeds.map(embed => `
            <div class="embed" ${embed.hexColor ? `style="border-left-color: ${embed.hexColor}"` : ''}>
                ${embed.title ? `<div class="embed-title">${embed.title}</div>` : ''}
                ${embed.description ? `<div>${embed.description}</div>` : ''}
            </div>
        `).join('');

        return `
            <div class="message-group">
                <img class="avatar" src="${await imageToBase64(msg.author.displayAvatarURL({ extension: 'png', size: 64 }))}" alt="${msg.author.tag}">
                <div class="message-content">
                    <div class="author-info">
                        <span class="username">${msg.author.username}</span>
                        <span class="timestamp">${new Date(msg.createdTimestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                    ${msg.content ? `<div class="message-text">${msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>` : ''}
                    ${attachmentsHtml ? `<div class="attachments">${attachmentsHtml}</div>` : ''}
                    ${embedsHtml}
                </div>
            </div>
        `;
    });

    // Espera todas as mensagens serem processadas
    const messageElements = await Promise.all(messagePromises);

    const html = `
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
            <title>Transcrição do Ticket #${channel.name}</title>
            <style>
                :root {
                    --bg-color: #1e1e2e;
                    --primary-color: #27293d;
                    --secondary-color: #3b3e5e;
                    --text-color: #cad3f5;
                    --accent-color: #e78284;
                    --mention-bg: #414569;
                }
                body {
                    font-family: 'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                    background-color: var(--bg-color);
                    color: var(--text-color);
                    margin: 0;
                    padding: 20px;
                }
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    background-color: var(--primary-color);
                    border-radius: 15px;
                    padding: 30px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--secondary-color);
                }
                .header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    border-bottom: 2px solid var(--secondary-color);
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .header-info h1 {
                    margin: 0;
                    font-size: 28px;
                    color: #fff;
                }
                .header-info p {
                    margin: 5px 0 0;
                    font-size: 14px;
                    color: #89b4fa;
                }
                .message-group {
                    display: flex;
                    margin-bottom: 20px;
                }
                .avatar {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    margin-right: 15px;
                    margin-top: 5px;
                }
                .message-content {
                    flex-grow: 1;
                }
                .author-info {
                    display: flex;
                    align-items: baseline;
                    margin-bottom: 8px;
                }
                .username {
                    font-weight: 700;
                    color: var(--accent-color);
                    font-size: 17px;
                }
                .timestamp {
                    font-size: 12px;
                    color: #a6adc8;
                    margin-left: 10px;
                }
                .message-text {
                    font-size: 15px;
                    line-height: 1.6;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                img.emoji {
                    width: 1.2em;
                    height: 1.2em;
                    vertical-align: middle;
                }
                .attachments {
                    margin-top: 10px;
                }
                .attachment-image {
                    max-width: 450px;
                    max-height: 400px;
                    border-radius: 8px;
                    margin-top: 8px;
                }
                .attachment-file a {
                    color: #89b4fa;
                    text-decoration: none;
                    background-color: var(--secondary-color);
                    padding: 8px 12px;
                    border-radius: 5px;
                    font-size: 14px;
                }
                .embed {
                    background-color: #181825;
                    border-left: 4px solid var(--secondary-color);
                    padding: 15px;
                    margin-top: 10px;
                    border-radius: 5px;
                }
                .embed-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid var(--secondary-color);
                    font-size: 12px;
                    color: #a6adc8;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img class="logo" src="${logoBase64}" alt="Logo do Servidor">
                    <div class="header-info">
                        <h1>Transcrição de Ticket</h1>
                        <p>Servidor: ${channel.guild.name} | Canal: #${channel.name}</p>
                    </div>
                </div>
                ${messageElements.join('')}
                <div class="footer">
                    <p>Transcrição gerada por ${channel.client.user.username}</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const filePath = `./transcript-${channel.id}.html`;
    fs.writeFileSync(filePath, html);
    return filePath;
}

module.exports = { generateTranscript };