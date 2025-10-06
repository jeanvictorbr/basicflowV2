// handlers/buttons/ponto_pause_service.js
const db = require('../../database.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');

module.exports = {
    customId: 'ponto_pause_service',
    async execute(interaction) {
        // Cancela timers de check ao pausar
        if (interaction.client.afkCheckTimers.has(interaction.user.id)) {
            clearTimeout(interaction.client.afkCheckTimers.get(interaction.user.id));
            interaction.client.afkCheckTimers.delete(interaction.user.id);
        }
        if (interaction.client.afkToleranceTimers.has(interaction.user.id)) {
            clearTimeout(interaction.client.afkToleranceTimers.get(interaction.user.id));
            interaction.client.afkToleranceTimers.delete(interaction.user.id);
        }
        await interaction.deferUpdate();
        
        const session = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (!session || session.is_paused) return;

        await db.query(
            'UPDATE ponto_sessions SET is_paused = true, last_pause_time = NOW() WHERE session_id = $1',
            [session.session_id]
        );

        const updatedSession = (await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [session.session_id])).rows[0];
        const dashboard = generatePontoDashboard(interaction, updatedSession);
        await interaction.editReply(dashboard);
    }
};