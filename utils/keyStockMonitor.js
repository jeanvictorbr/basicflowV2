// Substitua o conteúdo em: utils/keyStockMonitor.js
const db = require('../database.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function syncUsedKeys(client) {
    console.log('[Key Stock Monitor] Verificando chaves de ativação esgotadas...');
    const dbClient = await db.getClient(); // Pega um cliente do pool
    try {
        await dbClient.query('BEGIN');
        const exhaustedKeysResult = await dbClient.query(`SELECT key FROM activation_keys WHERE uses_left <= 0`);
        const exhaustedKeys = exhaustedKeysResult.rows;

        if (exhaustedKeys.length === 0) {
            console.log('[Key Stock Monitor] Nenhuma chave esgotada encontrada.');
            await dbClient.query('COMMIT');
            return; 
        }

        const keyValues = exhaustedKeys.map(k => k.key);
        const affectedProductsResult = await dbClient.query(`SELECT DISTINCT product_id FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
        const affectedProductIds = affectedProductsResult.rows.map(r => r.product_id);

        await dbClient.query(`DELETE FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
        await dbClient.query(`DELETE FROM activation_keys WHERE uses_left <= 0`);
        await dbClient.query('COMMIT');

        for (const productId of affectedProductIds) {
            await db.query(`UPDATE store_products SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false) WHERE id = $1`, [productId]);
        }
        
        if (affectedProductIds.length > 0) {
            const guildsToUpdate = await db.query(`SELECT DISTINCT guild_id FROM store_products WHERE id = ANY($1::int[])`, [affectedProductIds]);
            for (const row of guildsToUpdate.rows) {
                await updateStoreVitrine(client, row.guild_id);
            }
        }
    } catch (error) {
        if (dbClient) await dbClient.query('ROLLBACK').catch(console.error);
        console.error('[Key Stock Monitor] Erro ao sincronizar chaves de estoque:', error);
    } finally {
        if (dbClient) dbClient.release(); // DEVOLVE A CONEXÃO PARA O POOL
    }
}

module.exports = { syncUsedKeys };