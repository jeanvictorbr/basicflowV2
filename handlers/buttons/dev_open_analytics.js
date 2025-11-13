// handlers/buttons/dev_open_analytics.js
const periodHandler = require('./dev_analytics_period_.js');

module.exports = {
    customId: 'dev_open_analytics',
    async execute(interaction) {
        // Simula uma interação de botão "7d" para reusar a lógica
        interaction.customId = 'dev_analytics_period_7d';
        
        // Se for o comando inicial (botão do menu principal), deferimos como resposta efêmera
        // O handler de período espera um update, então tratamos isso:
        if (!interaction.deferred && !interaction.replied) {
             await interaction.deferReply({ ephemeral: true });
        }
        
        // Redireciona para o handler de período que contém toda a lógica SQL
        // Precisamos ajustar o execute do handler para não tentar deferir novamente se já estiver deferido
        // Mas como o handler de período faz 'deferUpdate', e aqui fizemos 'deferReply',
        // vamos chamar a lógica interna manualmente para evitar conflito de tipos de resposta.
        
        // --- Lógica Manual (Cópia simplificada do dev_analytics_period_.js para evitar conflito de reply/update) ---
        const generateDevAnalyticsDashboard = require('../../ui/devPanel/devAnalyticsDashboard.js');
        const db = require('../../database.js');
        const V2_FLAG = 1 << 15;
        const EPHEMERAL_FLAG = 1 << 6;
        
        const period = '7d';
        const timeFilter = "WHERE timestamp >= NOW() - INTERVAL '7 days'";

        try {
            const generalStats = (await db.query(`SELECT COUNT(*) as total_interactions, COUNT(DISTINCT guild_id) as active_guilds, COUNT(DISTINCT user_id) as active_users FROM interaction_logs ${timeFilter}`)).rows[0];
            const topCommands = (await db.query(`SELECT name, COUNT(*) as count FROM interaction_logs ${timeFilter} AND type = 'CHAT_INPUT' GROUP BY name ORDER BY count DESC LIMIT 5`)).rows;
            const topButtons = (await db.query(`SELECT name, COUNT(*) as count FROM interaction_logs ${timeFilter} AND type = 'BUTTON' GROUP BY name ORDER BY count DESC LIMIT 5`)).rows;
            const topModules = (await db.query(`SELECT module, COUNT(*) as count FROM interaction_logs ${timeFilter} AND module IS NOT NULL GROUP BY module ORDER BY count DESC LIMIT 5`)).rows;
            const topGuilds = (await db.query(`SELECT guild_id, COUNT(*) as count FROM interaction_logs ${timeFilter} GROUP BY guild_id ORDER BY count DESC LIMIT 5`)).rows;

            const payload = {
                components: generateDevAnalyticsDashboard({ general: generalStats, topCommands, topButtons, topModules, topGuilds }, interaction.client, period),
                flags: V2_FLAG | EPHEMERAL_FLAG
            };

            await interaction.editReply(payload);
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: "Erro ao carregar analytics." });
        }
    }
};