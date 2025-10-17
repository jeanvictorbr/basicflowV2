// Crie em: handlers/buttons/dev_open_ai_monitor.js
const db = require('../../database.js');
const generateDevAiMonitorMenu = require('../../ui/devPanel/devAiMonitorMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_ai_monitor',
    async execute(interaction) {
        await interaction.deferUpdate();

        const page = 0;
        const view = 'general'; // Visão padrão

        const totalResult = await db.query('SELECT COUNT(*) FROM ai_usage_logs');
        const logsResult = await db.query('SELECT * FROM ai_usage_logs ORDER BY created_at DESC LIMIT 1 OFFSET 0');
        
        await interaction.editReply({
            components: generateDevAiMonitorMenu(logsResult.rows, page, totalResult.rows[0].count, view),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};