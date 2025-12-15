const db = require('../../database.js');
const pontoDashboard = require('../../ui/pontoDashboardPessoalV2.js');
const { updatePontoLog } = require('../../utils/pontoLogManager.js');
const { managePontoRole } = require('../../utils/pontoRoleManager.js'); // <--- NOVO

module.exports = {
    customId: 'ponto_pause_service',
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const result = await db.query(`
            SELECT * FROM ponto_sessions 
            WHERE user_id = $1 AND guild_id = $2 AND (status = 'OPEN' OR status IS NULL)
        `, [userId, guildId]);

        if (result.rows.length === 0) return interaction.reply({ content: "Erro: Sessão não encontrada.", flags: 1<<6 });
        const session = result.rows[0];
        if (session.is_paused) return interaction.reply({ content: "Já pausado.", flags: 1<<6 });

        const now = new Date();

        await db.query(`
            UPDATE ponto_sessions SET is_paused = TRUE, last_pause_time = $1 WHERE session_id = $2
        `, [now, session.session_id]);

        const updatedResult = await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [session.session_id]);
        const updatedSession = updatedResult.rows[0];
        
        // --- AÇÕES ---
        updatePontoLog(interaction.client, updatedSession, interaction.user);
        managePontoRole(interaction.client, guildId, userId, 'REMOVE'); // <--- REMOVER CARGO
        
        const ui = pontoDashboard(updatedSession, interaction.member);
        await interaction.update(ui);
    }
};