// handlers/buttons/dev_ai_log_page_.js
const db = require('../../database.js');
const generateDevAiMonitorMenu = require('../../ui/devPanel/devAiMonitorMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_ai_log_page_',
    async execute(interaction) {
        await interaction.deferUpdate();

        // CORREÇÃO APLICADA AQUI: A desestruturação foi ajustada para pegar os índices corretos.
        const parts = interaction.customId.split('_');
        const view = parts[4];
        const page = parseInt(parts[5], 10);

        if (isNaN(page)) return;

        let totalResult, logsResult;
        const offset = page * 1; // 1 item por página

        if (view === 'guardian') {
            const featureName = 'Guardian AI';
            totalResult = await db.query('SELECT COUNT(*) FROM ai_usage_logs WHERE feature_name = $1', [featureName]);
            logsResult = await db.query('SELECT * FROM ai_usage_logs WHERE feature_name = $1 ORDER BY created_at DESC LIMIT 1 OFFSET $2', [featureName, offset]);
        } else { // 'general'
            totalResult = await db.query('SELECT COUNT(*) FROM ai_usage_logs');
            logsResult = await db.query('SELECT * FROM ai_usage_logs ORDER BY created_at DESC LIMIT 1 OFFSET $1', [offset]);
        }
        
        await interaction.editReply({
            components: generateDevAiMonitorMenu(logsResult.rows, page, totalResult.rows[0].count, view),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};