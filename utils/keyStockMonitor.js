// Substitua o conteúdo em: utils/keyStockMonitor.js
const db = require('../database.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function syncUsedKeys(client) {
    console.log('[Key Stock Monitor] Verificando chaves de ativação esgotadas...');
    // CORREÇÃO: Usa o withClient para garantir a liberação da conexão.
    await db.withClient(async (dbClient) => {
        try {
            await dbClient.query('BEGIN');
            const exhaustedKeysResult = await dbClient.query(`SELECT key FROM activation_keys WHERE uses_left <= 0`);
            const exhaustedKeys = exhaustedKeysResult.rows;

            if (exhaustedKeys.length === 0) {
                console.log('[Key Stock Monitor] Nenhuma chave esgotada encontrada.');
                await dbClient.query('COMMIT'); // Ainda precisa finalizar a transação
                return;
            }

            const keyValues = exhaustedKeys.map(k => k.key);
            const affectedProductsResult = await dbClient.query(`SELECT DISTINCT product_id FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
            const affectedProductIds = affectedProductsResult.rows.map(r => r.product_id);

            await dbClient.query(`DELETE FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
            await dbClient.query(`DELETE FROM activation_keys WHERE uses_left <= 0`);
            await dbClient.query('COMMIT');

            // Estas operações podem usar db.query pois são chamadas fora da transação
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
            console.error('[Key Stock Monitor] Erro ao sincronizar chaves de estoque:', error);
            // O rollback já é tratado pelo erro no bloco try/catch do withClient
            // mas podemos adicionar por segurança se a função withClient não o fizer.
            try { await dbClient.query('ROLLBACK'); } catch (rbError) { console.error('Falha no rollback:', rbError); }
        }
    }); // O cliente é liberado automaticamente aqui.
}

module.exports = { syncUsedKeys };