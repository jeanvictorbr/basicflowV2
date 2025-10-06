// Crie em: handlers/buttons/ponto_pause_service.js
const db = require('../../database.js');
const generatePontoDashboard = require('../../ui/pontoDashboardPessoal.js');

module.exports = {
    customId: 'ponto_pause_service',
    async execute(interaction) {
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