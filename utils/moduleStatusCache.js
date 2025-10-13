// Crie este novo arquivo em: utils/moduleStatusCache.js
const db = require('../database.js');

async function updateModuleStatusCache(client) {
    console.log('[Feature Flags] A atualizar o cache de status dos módulos...');
    try {
        const statusResult = await db.query('SELECT * FROM module_status');
        const statusMap = new Map(statusResult.rows.map(row => [row.module_name, row]));
        client.moduleStatusCache = statusMap;
        console.log('[Feature Flags] Cache atualizado com sucesso.');
    } catch (error) {
        console.error('[Feature Flags] Erro ao atualizar o cache:', error);
    }
}

module.exports = { updateModuleStatusCache };