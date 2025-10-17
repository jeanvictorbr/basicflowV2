// Caminho: utils/keyStockMonitor.js
const db = require('../database.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function syncUsedKeys(client) {
    console.log('[Key Stock Monitor] Verificando chaves de ativação esgotadas...');
    await db.withTransaction(async (dbClient) => { // <-- USA withTransaction
        const exhaustedKeysResult = await dbClient.query(`SELECT key FROM activation_keys WHERE uses_left <= 0 FOR UPDATE`);
        if (exhaustedKeysResult.rows.length === 0) return;

        const keyValues = exhaustedKeysResult.rows.map(k => k.key);
        
        const affectedProductsResult = await dbClient.query(`SELECT DISTINCT p.guild_id, s.product_id FROM store_stock s JOIN store_products p ON s.product_id = p.id WHERE s.content = ANY($1::text[])`, [keyValues]);
        const affectedGuilds = [...new Set(affectedProductsResult.rows.map(r => r.guild_id))];
        const affectedProductIds = [...new Set(affectedProductsResult.rows.map(r => r.product_id))];

        await dbClient.query(`DELETE FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
        await dbClient.query(`DELETE FROM activation_keys WHERE key = ANY($1::text[])`, [keyValues]);

        for (const productId of affectedProductIds) {
            await dbClient.query(`UPDATE store_products SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false) WHERE id = $1`, [productId]);
        }
        
        // Retorna as guildas para atualizar fora da transação
        return affectedGuilds;
    }).then(affectedGuilds => {
        if (affectedGuilds && affectedGuilds.length > 0) {
            for (const guildId of affectedGuilds) {
                updateStoreVitrine(client, guildId).catch(err => console.error(`[Key Stock] Erro ao atualizar vitrine para ${guildId}:`, err));
            }
        }
    }).catch(error => {
        console.error('[Key Stock Monitor] Erro ao sincronizar chaves de estoque:', error);
    });
}

module.exports = { syncUsedKeys };