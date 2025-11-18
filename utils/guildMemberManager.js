// utils/guildMemberManager.js
const crypto = require('crypto');
const db = require('../database.js');

// Pega a chave do seu .env
const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY; 
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Descriptografa um token de acesso.
 */
function decrypt(encryptedText) {
    if (!ENCRYPTION_KEY) {
        throw new Error('OAUTH_ENCRYPTION_KEY não definida no .env');
    }
    if (!encryptedText) {
        throw new Error('Token criptografado está nulo ou vazio.');
    }

    try {
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encryptedData = Buffer.from(textParts.join(':'), 'hex');
        const key = Buffer.from(ENCRYPTION_KEY, 'hex');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        return decrypted.toString();
    } catch (error) {
        console.error(`Falha ao descriptografar token: ${error.message}`);
        throw new Error('Falha na descriptografia.');
    }
}

/**
 * Tenta adicionar um usuário a uma guilda usando seu access_token.
 */
async function addMemberToGuild(guild, userId, encryptedAccessToken) {
    let accessToken;
    try {
        accessToken = decrypt(encryptedAccessToken);
    } catch (e) {
        console.error(`[GuildMemberManager] Falha ao descriptografar token para ${userId}: ${e.message}`);
        throw new Error('Falha na descriptografia');
    }

    try {
        // Esta é a função que FORÇA o usuário a entrar
        await guild.members.add(userId, {
            accessToken: accessToken
        });
        return true; // Sucesso
    } catch (error) {
        console.error(`[GuildMemberManager] Falha ao adicionar ${userId} à guilda ${guild.id}: ${error.code} ${error.message}`);
        
        // Se o token expirou (401) ou o usuário baniu o bot (403),
        // não podemos fazer nada.
        // Se o usuário já está na guilda (429 ou 304), não é um erro.
        if (error.code === 10013) { // Unknown User
            throw new Error('Usuário não encontrado.');
        }
        if (error.code === 40003) { // Guild Sincronizando
             throw new Error('Guilda sincronizando, tente mais tarde.');
        }
        
        // Trata como "sucesso" se ele já estiver lá
        if (error.message.includes('user is already in guild')) {
            return true;
        }

        throw error; // Lança outros erros (ex: 401, 403)
    }
}

module.exports = { addMemberToGuild, decrypt };