// Crie em: handlers/buttons/dev_open_key_stats.js
const db = require('../../database.js');
const generateDevKeyStatsMenu = require('../../ui/devPanel/devKeyStatsMenu.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_open_key_stats',
    async execute(interaction) {
        await interaction.deferUpdate();

        // Busca e agrupa as chaves por features, duração e usos
        const statsResult = await db.query(`
            SELECT 
                grants_features, 
                duration_days, 
                uses_left, 
                COUNT(*) as key_count, 
                SUM(uses_left) as total_uses_left
            FROM activation_keys 
            WHERE uses_left > 0
            GROUP BY grants_features, duration_days, uses_left
            ORDER BY key_count DESC, grants_features, duration_days
        `);

        await interaction.editReply({
            components: generateDevKeyStatsMenu(statsResult.rows),
            flags: V2_FLAG | EPHEMERAL_FLAG,
        });
    }
};