// utils/featureCheck.js
const db = require('../database.js');

async function hasFeature(guildId, featureKey) {
    if (!guildId || !featureKey) return false;
    
    const settings = (await db.query('SELECT enabled_features, premium_expires_at FROM guild_settings WHERE guild_id = $1', [guildId])).rows[0];
    
    if (!settings || !settings.enabled_features || !settings.premium_expires_at) {
        return false;
    }

    const now = new Date();
    const expiresAt = new Date(settings.premium_expires_at);

    if (now > expiresAt) {
        // A licença expirou, vamos limpar as features no DB
        await db.query('UPDATE guild_settings SET enabled_features = \'\', premium_expires_at = NULL WHERE guild_id = $1', [guildId]);
        return false;
    }

    const enabledFeatures = settings.enabled_features.split(',');

    // Se a guilda tiver a feature "ALL", ela tem acesso a tudo.
    if (enabledFeatures.includes('ALL')) {
        return true;
    }

    // Verifica se a feature específica está na lista
    return enabledFeatures.includes(featureKey);
}

module.exports = hasFeature;