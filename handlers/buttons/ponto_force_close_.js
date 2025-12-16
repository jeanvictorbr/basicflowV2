const db = require('../../database.js');
const { calculateSessionTime } = require('../../utils/pontoUtils.js');
const { updatePontoLog } = require('../../utils/pontoLogManager.js');
const { managePontoRole } = require('../../utils/pontoRoleManager.js');

module.exports = {
    // O ID vem como 'ponto_force_close_SESSIONID'
    customId: 'ponto_force_close_', 
    async execute(interaction) {
        // Extrai o ID da sessão do customId do botão
        const sessionId = interaction.customId.split('_').pop();
        const guildId = interaction.guild.id;

        // 1. Busca a sessão alvo
        const result = await db.query(`
            SELECT * FROM ponto_sessions 
            WHERE session_id = $1 AND guild_id = $2
        `, [sessionId, guildId]);

        if (result.rows.length === 0) {
            return interaction.reply({ content: "❌ Sessão não encontrada ou já purgada.", ephemeral: true });
        }

        const session = result.rows[0];

        // Se já estiver fechada, avisa
        if (session.status === 'CLOSED' && session.end_time) {
            return interaction.reply({ content: "⚠️ Esta sessão já foi finalizada anteriormente.", ephemeral: true });
        }

        const now = new Date();
        const nowMs = now.getTime();

        // 2. Calcula pausas pendentes (Igual ao end_service)
        let finalTotalPause = parseInt(session.total_paused_ms || 0);
        if (session.is_paused && session.last_pause_time) {
            const lastPauseMs = new Date(session.last_pause_time).getTime();
            if (!isNaN(lastPauseMs)) {
                finalTotalPause += Math.max(0, nowMs - lastPauseMs);
            }
        }

        // 3. Atualiza a tabela de Sessões (Fecha o expediente)
        // Setamos 'status' para CLOSED e definimos o 'end_time' para agora
        await db.query(`
            UPDATE ponto_sessions 
            SET status = 'CLOSED', end_time = $1, is_paused = FALSE, total_paused_ms = $2 
            WHERE session_id = $3
        `, [now, finalTotalPause, sessionId]);

        // Atualiza objeto local para o cálculo
        session.end_time = now;
        session.status = 'CLOSED';
        session.total_paused_ms = finalTotalPause;
        session.is_paused = false;

        // 4. Calcula o tempo usando seu Utils Blindado
        const timeData = calculateSessionTime(session);

        // ====================================================================================
        // CORREÇÃO: Salvar no Ranking (ponto_leaderboard)
        // ====================================================================================
        if (timeData.durationMs > 0) {
            await db.query(`
                INSERT INTO ponto_leaderboard (user_id, guild_id, total_ms)
                VALUES ($1, $2, $3)
                ON CONFLICT (guild_id, user_id) 
                DO UPDATE SET total_ms = ponto_leaderboard.total_ms + $3
            `, [session.user_id, guildId, timeData.durationMs]);
        }
        // ====================================================================================

        // 5. Tenta pegar o usuário para remover o cargo e atualizar log
        let user;
        try {
            user = await interaction.client.users.fetch(session.user_id);
        } catch (e) {
            user = null; // Usuário pode ter saído do servidor
        }

        if (user) {
            // Atualiza o Log se o usuário ainda existir
            updatePontoLog(interaction.client, session, user);
            // Remove o cargo
            managePontoRole(interaction.client, guildId, session.user_id, 'REMOVE');
        }

        // 6. Resposta para o Admin que clicou
        await interaction.reply({
            content: `✅ **Sessão #${sessionId} finalizada com força!**\n👤 Usuário: <@${session.user_id}>\n⏱️ Tempo Contabilizado: \`${timeData.formatted}\``,
            ephemeral: true
        });

        // Opcional: Atualizar a mensagem original do painel de admin para remover o botão ou mostrar "Resolvido"
        // Isso depende de como o 'ponto_admin_view_sessions' monta a UI, mas geralmente apenas responder resolve.
    }
};