// Substitua o conteúdo em: utils/keyStockMonitor.js
const db = require('../database.js');
const updateStoreVitrine = require('./updateStoreVitrine.js');

async function syncUsedKeys(client) {
    console.log('[Key Stock Monitor] Verificando chaves de ativação esgotadas...');
    // CORREÇÃO: Toda a lógica agora é envolvida pelo withClient para garantir a liberação da conexão.
    await db.withClient(async (dbClient) => {
        try {
            await dbClient.query('BEGIN');

            const exhaustedKeysResult = await dbClient.query(`SELECT key FROM activation_keys WHERE uses_left <= 0 FOR UPDATE`);
            const exhaustedKeys = exhaustedKeysResult.rows;

            if (exhaustedKeys.length === 0) {
                // Ainda precisamos finalizar a transação, mesmo que vazia.
                await dbClient.query('COMMIT');
                return;
            }

            const keyValues = exhaustedKeys.map(k => k.key);

            // Encontra os produtos afetados ANTES de deletar as chaves
            const affectedProductsResult = await dbClient.query(`SELECT DISTINCT p.guild_id, s.product_id FROM store_stock s JOIN store_products p ON s.product_id = p.id WHERE s.content = ANY($1::text[])`, [keyValues]);
            const affectedGuilds = [...new Set(affectedProductsResult.rows.map(r => r.guild_id))];
            const affectedProductIds = [...new Set(affectedProductsResult.rows.map(r => r.product_id))];

            // Deleta o estoque e as chaves
            await dbClient.query(`DELETE FROM store_stock WHERE content = ANY($1::text[])`, [keyValues]);
            await dbClient.query(`DELETE FROM activation_keys WHERE key = ANY($1::text[])`, [keyValues]);

            // Atualiza a contagem de estoque para os produtos afetados
            for (const productId of affectedProductIds) {
                await dbClient.query(`UPDATE store_products SET stock = (SELECT COUNT(*) FROM store_stock WHERE product_id = $1 AND is_claimed = false) WHERE id = $1`, [productId]);
            }
            
            await dbClient.query('COMMIT');

            // Dispara a atualização da vitrine para cada servidor afetado
            for (const guildId of affectedGuilds) {
                await updateStoreVitrine(client, guildId);
            }

        } catch (error) {
            console.error('[Key Stock Monitor] Erro ao sincronizar chaves de estoque:', error);
            // Tenta fazer rollback em caso de erro
            try { await dbClient.query('ROLLBACK'); } catch (rbError) { console.error('Falha no rollback do Key Stock Monitor:', rbError); }
        }
    }); // O cliente é liberado aqui, não importa o que aconteça.
}

module.exports = { syncUsedKeys };