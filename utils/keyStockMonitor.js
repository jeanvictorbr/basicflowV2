// Substitua o conteúdo em: utils/keyStockMonitor.js
const db = require('../database.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function syncUsedKeys(client) {
    console.log('[Key Stock Monitor] Verificando chaves de ativação esgotadas...');
    
    try {
        const affectedGuilds = await db.withTransaction(async (dbClient) => {
            const exhaustedKeysResult = await dbClient.query(`SELECT key FROM activation_keys WHERE uses_left <= 0 FOR UPDATE`);
            
            if (exhaustedKeysResult.rows.length === 0) {
                // Nenhuma chave para remover, a transação termina aqui.
                return []; // Retorna um array vazio para não fazer nada depois.
            }

            const keyValues = exhaustedKeysResult.rows.map(k => k.key);
            
            // Log aprimorado que você pediu:
            console.log(`[Key Stock Monitor] Encontrado e a remover ${keyValues.length} chave(s) esgotada(s).`);

            const affectedProductsResult = await dbClient.query(
                `SELECT DISTINCT p.guild_id, s.product_id 
                 FROM store_stock s 
                 JOIN store_products p ON s.product_id = p.id 
                 WHERE s.content = ANY($1::text[])`, 
                [keyValues]
            );
            const guildsToUpdate = [...new Set(affectedProductsResult.rows.map(r => r.guild_id))];
            const productIdsToUpdate = [...new Set(affectedProductsResult.rows.map(r => r.product_id))];

            await dbClient.query(`DELETE FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
            await dbClient.query(`DELETE FROM activation_keys WHERE key = ANY($1::text[])`, [keyValues]);

            for (const productId of productIdsToUpdate) {
                await dbClient.query(
                    `UPDATE store_products 
                     SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false) 
                     WHERE id = $1`, 
                    [productId]
                );
            }
            
            return guildsToUpdate;
        });

        if (affectedGuilds && affectedGuilds.length > 0) {
            console.log(`[Key Stock Monitor] Atualizando vitrine para ${affectedGuilds.length} servidor(es).`);
            for (const guildId of affectedGuilds) {
                await updateStoreVitrine(client, guildId);
            }
        }

    } catch (error) {
        console.error('[Key Stock Monitor] Erro ao sincronizar chaves de estoque:', error);
    }
}

module.exports = { syncUsedKeys };