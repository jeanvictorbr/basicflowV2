const db = require('../../database.js');
const { calculateSessionTime } = require('../../utils/pontoUtils.js');
const { updatePontoLog } = require('../../utils/pontoLogManager.js');
const { managePontoRole } = require('../../utils/pontoRoleManager.js');

module.exports = {
    customId: 'ponto_force_close_', 
    async execute(interaction) {
        // Pega o ID depois do ultimo underscore
        const sessionId = interaction.customId.split('_').pop();
        const guildId = interaction.guild.id;

        // 1. Busca a sessão (mesmo se o banco achar que está fechada, vamos conferir)
        const result = await db.query(`
            SELECT * FROM ponto_sessions WHERE session_id = $1
        `, [sessionId]);

        if (result.rows.length === 0) {
            return interaction.update({ content: "❌ Sessão não encontrada no banco.", components: [] });
        }

        const session = result.rows[0];
        const now = new Date();
        const nowMs = now.getTime();

        // 2. FORÇA o Status para CLOSED e define End Time AGORA
        // Isso garante que ela saia da lista de 'OPEN'
        await db.query(`
            UPDATE ponto_sessions 
            SET status = 'CLOSED', end_time = $1, is_paused = FALSE 
            WHERE session_id = $2
        `, [now, sessionId]);

        // Atualiza objeto local para cálculo correto
        session.end_time = now;
        session.status = 'CLOSED';
        session.is_paused = false;

        // 3. Calcula e Salva no Ranking (ponto_leaderboard)
        const timeData = calculateSessionTime(session);

        if (timeData.durationMs > 0) {
            await db.query(`
                INSERT INTO ponto_leaderboard (user_id, guild_id, total_ms)
                VALUES ($1, $2, $3)
                ON CONFLICT (guild_id, user_id) 
                DO UPDATE SET total_ms = ponto_leaderboard.total_ms + $3
            `, [session.user_id, guildId, timeData.durationMs]);
        }

        // 4. Limpeza (Remove cargo e atualiza log)
        try {
            await managePontoRole(interaction.client, guildId, session.user_id, 'REMOVE');
            
            // Tenta buscar o usuário para atualizar o log (pode falhar se ele saiu do server)
            const user = await interaction.client.users.fetch(session.user_id).catch(() => null);
            if (user) {
                updatePontoLog(interaction.client, session, user);
            }
        } catch (err) {
            console.log("Erro menor na limpeza do Force Close:", err.message);
        }

        // 5. Feedback Visual: Remove TODOS os botões da mensagem para "limpar" a tela do admin
        await interaction.update({
            content: `✅ **Resolvido!** Sessão **#${sessionId}** encerrada.\n👤 Usuário: <@${session.user_id}>\n⏱️ Tempo Creditado: \`${timeData.formatted}\``,
            components: [] 
        });
    }
};