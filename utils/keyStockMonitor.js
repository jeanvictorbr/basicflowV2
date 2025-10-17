// Crie o arquivo: utils/keyStockMonitor.js
const db = require('../database.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function syncUsedKeys(client) {
    console.log('[Key Stock Monitor] Verificando chaves de ativação esgotadas...');

    const dbClient = await db.getClient();
    try {
        await dbClient.query('BEGIN');

        // Encontra todas as chaves com 0 usos restantes
        const exhaustedKeysResult = await dbClient.query(`SELECT key FROM activation_keys WHERE uses_left <= 0`);
        const exhaustedKeys = exhaustedKeysResult.rows;

        if (exhaustedKeys.length === 0) {
            console.log('[Key Stock Monitor] Nenhuma chave esgotada encontrada.');
            await dbClient.query('COMMIT');
            return;
        }

        console.log(`[Key Stock Monitor] Encontradas ${exhaustedKeys.length} chaves esgotadas para remover do estoque.`);

        const keyValues = exhaustedKeys.map(k => k.key);
        
        // Encontra os product_ids que serão afetados antes de deletar o estoque
        const affectedProductsResult = await dbClient.query(
            `SELECT DISTINCT product_id FROM store_stock WHERE content = ANY($1::text[])`,
            [keyValues]
        );
        const affectedProductIds = affectedProductsResult.rows.map(r => r.product_id);

        // Remove os itens de estoque correspondentes às chaves esgotadas
        const deleteStockResult = await dbClient.query(
            `DELETE FROM store_stock WHERE content = ANY($1::text[])`,
            [keyValues]
        );

        if (deleteStockResult.rowCount > 0) {
            console.log(`[Key Stock Monitor] ${deleteStockResult.rowCount} chaves removidas do estoque real.`);

            // Atualiza a contagem de estoque para cada produto afetado
            for (const productId of affectedProductIds) {
                await dbClient.query(`
                    UPDATE store_products
                    SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false)
                    WHERE id = $1
                `, [productId]);
            }
            console.log(`[Key Stock Monitor] Contagem de estoque atualizada para ${affectedProductIds.length} produto(s).`);
        }

        // Finalmente, remove as chaves da tabela principal para limpeza
        await dbClient.query(`DELETE FROM activation_keys WHERE uses_left <= 0`);

        await dbClient.query('COMMIT');

        // Atualiza a vitrine de todas as guilds afetadas (se houver)
        if (affectedProductIds.length > 0) {
            const guildsToUpdate = await db.query(
                `SELECT DISTINCT guild_id FROM store_products WHERE id = ANY($1::int[])`,
                [affectedProductIds]
            );
            for (const row of guildsToUpdate.rows) {
                await updateStoreVitrine(client, row.guild_id);
            }
        }

    } catch (error) {
        await dbClient.query('ROLLBACK');
        console.error('[Key Stock Monitor] Erro ao sincronizar chaves de estoque:', error);
    } finally {
        dbClient.release();
    }
}

module.exports = { syncUsedKeys };