// utils/featureCheck.js
const db = require('../database.js');

async function hasFeature(guildId, featureKey) {
    if (!guildId || !featureKey) return false;

    try {
        // Primeiro, verifica a feature "ALL"
        const allFeatureResult = await db.query(
            "SELECT 1 FROM guild_features WHERE guild_id = $1 AND feature_key = 'ALL' AND expires_at > NOW()",
            [guildId]
        );
        if (allFeatureResult.rows.length > 0) {
            return true;
        }

        // Se não tiver "ALL", verifica a feature específica
        const specificFeatureResult = await db.query(
            "SELECT 1 FROM guild_features WHERE guild_id = $1 AND feature_key = $2 AND expires_at > NOW()",
            [guildId, featureKey]
        );
        return specificFeatureResult.rows.length > 0;

    } catch (error) {
        console.error(`[Feature Check] Erro ao verificar feature '${featureKey}' para guild ${guildId}:`, error);
        return false;
    }
}

module.exports = hasFeature;