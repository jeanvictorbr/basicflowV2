// Local: utils/encryption.js (No Bot) 
// Local: encryption.js (No Site, se estiver na raiz)
const crypto = require('crypto');
require('dotenv').config();

// Algoritmo padrão
const ALGORITHM = 'aes-256-cbc';

// Gera a chave baseada no TOKEN para garantir que seja igual nos dois lados
// IMPORTANTE: O .env dos dois projetos deve ter o mesmo DISCORD_TOKEN
const ENCRYPTION_KEY = crypto.createHash('sha256')
    .update(String(process.env.DISCORD_TOKEN))
    .digest('base64')
    .substr(0, 32);

function encrypt(text) {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let encrypted = cipher.update(String(text));
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // Retorna no formato IV:CONTEUDO
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (e) {
        console.error('Encryption Error:', e.message);
        return null;
    }
}

function decrypt(text) {
    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedText = Buffer.from(textParts.join(':'), 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption Error:', e.message);
        // Retorna null para quem chamou saber que falhou
        return null;
    }
}

module.exports = { encrypt, decrypt };