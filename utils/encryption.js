// Local: utils/encryption.js
const crypto = require('crypto');
require('dotenv').config();

const ALGORITHM = 'aes-256-cbc';

// Mantivemos sua lógica de chave original para compatibilidade total
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
        
        // RETORNA UM OBJETO (Melhor para o Banco de Dados SQL)
        // Mas se você der console.log ou somar com string, ele vira o formato antigo "IV:CONTENT"
        const result = { 
            iv: iv.toString('hex'), 
            content: encrypted.toString('hex'),
            toString: function() { return this.iv + ':' + this.content; } 
        };
        return result;
    } catch (e) {
        console.error('Encryption Error:', e.message);
        return null;
    }
}

function decrypt(data) {
    try {
        let iv, encryptedText;

        // NOVA ADIÇÃO: Verifica se é o formato Objeto (do Banco) ou String (do Site)
        if (typeof data === 'string') {
            const textParts = data.split(':');
            iv = Buffer.from(textParts.shift(), 'hex');
            encryptedText = Buffer.from(textParts.join(':'), 'hex');
        } else if (data && data.iv && data.content) {
            iv = Buffer.from(data.iv, 'hex');
            encryptedText = Buffer.from(data.content, 'hex');
        } else {
            return null;
        }
        
        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption Error:', e.message);
        return null;
    }
}

module.exports = { encrypt, decrypt };