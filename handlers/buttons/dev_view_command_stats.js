// handlers/buttons/dev_view_command_stats.js
const db = require('../../database');
const generateCommandStatsMenu = require('../../ui/devPanel/devCommandStatsMenu');
const generateErrorLogViewer = require('../../ui/devPanel/devErrorLogViewer'); // Reutiliza o visualizador de erro

module.exports = {
    customId: 'dev_view_command_stats',
    async execute(interaction) {
        await interaction.deferUpdate();

        try {
            const result = await db.query(`
                SELECT command_name, COUNT(*) as usage_count 
                FROM command_usage 
                GROUP BY command_name 
                ORDER BY usage_count DESC 
                LIMIT 15;
            `);

            const totalCommandsResult = await db.query('SELECT COUNT(*) as total FROM command_usage;');
            const total = totalCommandsResult.rows.length > 0 ? totalCommandsResult.rows[0].total : 0;

            const stats = {
                ranking: result.rows,
                total: total
            };

            await interaction.editReply(generateCommandStatsMenu(stats));

        } catch (error) {
            console.error("Erro ao buscar estatísticas de comandos:", error);
            
            // CORREÇÃO: Retorna uma mensagem de erro no formato V2
            const errorMessage = "Ocorreu um erro ao buscar as estatísticas.\nVerifique se a tabela `command_usage` foi criada no banco de dados.";
            await interaction.editReply(generateErrorLogViewer(errorMessage, 'Erro'));
        }
    }
};