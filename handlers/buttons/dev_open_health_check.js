// handlers/buttons/dev_open_health_check.js
const generateHealthCheckMenu = require('../../ui/devPanel/healthCheckMenu.js');

module.exports = {
    customId: 'dev_open_health_check',
    async execute(interaction) {
        // Defer a resposta para que o bot tenha tempo de coletar os dados
        await interaction.deferUpdate();

        // Coleta as estatísticas do sistema
        const stats = {
            uptime: process.uptime(),
            apiLatency: Math.round(interaction.client.ws.ping),
            ramUsage: (process.memoryUsage().rss / 1024 / 1024).toFixed(2), // RSS em MB
        };

        // Edita a resposta original com o menu de saúde atualizado
        await interaction.editReply(generateHealthCheckMenu(stats));
    }
};