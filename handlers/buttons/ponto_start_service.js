const db = require('../../database.js');
const pontoDashboard = require('../../ui/pontoDashboardPessoalV2.js');
const { updatePontoLog } = require('../../utils/pontoLogManager.js');
const { managePontoRole } = require('../../utils/pontoRoleManager.js');

module.exports = {
    customId: 'ponto_start_service',
    async execute(interaction) {
        // REMOVIDO: interaction.deferReply (o index.js já fez isso)

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const now = new Date();

        const check = await db.query(`
            SELECT * FROM ponto_sessions 
            WHERE user_id = $1 AND guild_id = $2 AND (status = 'OPEN' OR status IS NULL)
        `, [userId, guildId]);

        if (check.rows.length > 0) {
            // CORREÇÃO: Usar editReply
            return interaction.editReply(pontoDashboard(check.rows[0], interaction.member));
        }

        const result = await db.query(`
            INSERT INTO ponto_sessions (user_id, guild_id, start_time, status, is_paused, total_paused_ms)
            VALUES ($1, $2, $3, 'OPEN', false, 0)
            RETURNING *;
        `, [userId, guildId, now]);

        const session = result.rows[0];

        // --- AÇÕES ---
        await updatePontoLog(interaction.client, session, interaction.user);
        await managePontoRole(interaction.client, guildId, userId, 'ADD');

        const dashboard = pontoDashboard(session, interaction.member);
        
        // CORREÇÃO: Usar editReply
        await interaction.editReply(dashboard);
    }
};