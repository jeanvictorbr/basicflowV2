// handlers/buttons/ponto_end_service.js
const db = require('../../database.js');
const { calculateSessionTime } = require('../../utils/pontoUtils.js');
const { updatePontoLog } = require('../../utils/pontoLogManager.js');
const { managePontoRole } = require('../../utils/pontoRoleManager.js');

module.exports = {
    customId: 'ponto_end_service',
    async execute(interaction) {
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        // 1. Busca a sessão aberta
        const result = await db.query(`
            SELECT * FROM ponto_sessions 
            WHERE user_id = $1 AND guild_id = $2 AND (status = 'OPEN' OR status IS NULL OR end_time IS NULL)
            ORDER BY session_id DESC LIMIT 1
        `, [userId, guildId]);

        if (result.rows.length === 0) {
            // Edita a mensagem para não travar a interação se o botão for clicado e não houver sessão
            return interaction.update({ content: "❌ Sessão não encontrada ou já finalizada.", embeds: [], components: [] }).catch(() => {});
        }

        const session = result.rows[0];
        const now = new Date();
        const nowMs = now.getTime();

        // 2. Lógica de Pausa: Se estava pausado ao fechar, calcula o tempo de pausa pendente
        // Isso impede que o tempo pausado conte como tempo trabalhado
        let finalTotalPause = parseInt(session.total_paused_ms || 0);
        if (session.is_paused && session.last_pause_time) {
            const lastPauseMs = new Date(session.last_pause_time).getTime();
            if (!isNaN(lastPauseMs)) {
                // Adiciona o tempo desde a última pausa até agora ao total de pausas
                finalTotalPause += Math.max(0, nowMs - lastPauseMs);
            }
        }

        // 3. Atualiza a Sessão no DB (Fecha ela)
        await db.query(`
            UPDATE ponto_sessions 
            SET status = 'CLOSED', end_time = $1, is_paused = FALSE, total_paused_ms = $2 
            WHERE session_id = $3
        `, [now, finalTotalPause, session.session_id]);

        // Atualiza o objeto local para o cálculo funcionar com os dados novos
        session.end_time = now;
        session.status = 'CLOSED';
        session.total_paused_ms = finalTotalPause;
        session.is_paused = false;

        // 4. Calcula o tempo final usando seu Utils Blindado
        const timeData = calculateSessionTime(session);

        // =================================================================================
        // CORREÇÃO: SALVAR NO RANKING
        // Usa timeData.durationMs que vem do seu utils (que é o tempo líquido trabalhado)
        // =================================================================================
        if (timeData.durationMs > 0) {
            await db.query(`
                INSERT INTO ponto_ranking (user_id, guild_id, total_time)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, guild_id)
                DO UPDATE SET total_time = ponto_ranking.total_time + $3
            `, [userId, guildId, timeData.durationMs]);
        }

        // 5. Logs e Cargos
        updatePontoLog(interaction.client, session, interaction.user);
        managePontoRole(interaction.client, guildId, userId, 'REMOVE'); // Remove o cargo de trabalho

        // 6. Feedback Visual
        const finalEmbed = {
            title: "✅ Expediente Finalizado",
            color: 0xFF0000, // Vermelho
            thumbnail: { url: interaction.user.displayAvatarURL() },
            fields: [
                { name: "Usuário", value: `<@${userId}>`, inline: true },
                { name: "Tempo Total", value: `\`${timeData.formatted}\``, inline: true },
                { name: "Fim", value: `<t:${Math.floor(nowMs / 1000)}:f>`, inline: true }
            ],
            footer: { text: `Sessão #${session.session_id} encerrada e salva no ranking.` }
        };

        await interaction.update({ embeds: [finalEmbed], components: [] });
    }
};