// utils/featureCheck.js
const db = require('../database.js');

async function hasFeature(guildId, featureKey) {
    if (!guildId || !featureKey) return false;

    try {
        // --- LÓGICA CORRIGIDA E FINAL ---

        // 1. Condição Especial para 'ARQUITETO'
        // Se a feature for 'ARQUITETO', nós ignoramos completamente a verificação da feature 'ALL'.
        // Esta query SÓ procurará pela chave 'ARQUITETO'.
        if (featureKey === 'ARQUITETO') {
            const architectFeatureResult = await db.query(
                "SELECT 1 FROM guild_features WHERE guild_id = $1 AND feature_key = 'ARQUITETO' AND expires_at > NOW()",
                [guildId]
            );
            return architectFeatureResult.rows.length > 0;
        }

        // 2. Lógica Padrão para TODAS as outras features
        // Para qualquer outra feature, verificamos se a guilda tem a chave específica OU a chave 'ALL'.
        const generalFeatureResult = await db.query(
            "SELECT 1 FROM guild_features WHERE guild_id = $1 AND (feature_key = $2 OR feature_key = 'ALL') AND expires_at > NOW()",
            [guildId, featureKey]
        );
        return generalFeatureResult.rows.length > 0;

    } catch (error) {
        console.error(`[Feature Check] Erro ao verificar feature '${featureKey}' para guild ${guildId}:`, error);
        return false;
    }
}

module.exports = hasFeature;