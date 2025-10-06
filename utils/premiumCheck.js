// Crie em: utils/premiumCheck.js
const db = require('../database.js');

async function isPremiumActive(guildId) {
    if (!guildId) return false;
    const settings = (await db.query('SELECT premium_status, premium_expires_at FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    
    if (!settings || !settings.premium_status || !settings.premium_expires_at) {
        return false;
    }

    const now = new Date();
    const expiresAt = new Date(settings.premium_expires_at);

    if (now > expiresAt) {
        // A licença expirou, vamos desativá-la no DB
        await db.query('UPDATE guild_settings SET premium_status = false WHERE guild_id = $1', [guildId]);
        return false;
    }

    return true;
}

module.exports = isPremiumActive;