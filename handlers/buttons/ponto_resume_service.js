// Crie em: handlers/buttons/ponto_resume_service.js
const db = require('../../database.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');

module.exports = {
    customId: 'ponto_resume_service',
    async execute(interaction) {
        await interaction.deferUpdate();

        const session = (await db.query('SELECT * FROM ponto_sessions WHERE user_id = $1 AND guild_id = $2', [interaction.user.id, interaction.guild.id])).rows[0];
        if (!session || !session.is_paused) return;

        const lastPauseTime = new Date(session.last_pause_time);
        const pauseDurationMs = Date.now() - lastPauseTime.getTime();

        await db.query(
            'UPDATE ponto_sessions SET is_paused = false, last_pause_time = NULL, total_paused_ms = total_paused_ms + $1 WHERE session_id = $2',
            [pauseDurationMs, session.session_id]
        );

        const updatedSession = (await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [session.session_id])).rows[0];
        const dashboard = generatePontoDashboard(interaction, updatedSession);
        await interaction.editReply(dashboard);
    }
};