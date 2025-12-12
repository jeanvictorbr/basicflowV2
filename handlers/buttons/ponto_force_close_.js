// handlers/buttons/ponto_force_close_.js
const db = require('../../database.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ponto_force_close_', // Dinâmico
    async execute(interaction) {
        const sessionId = interaction.customId.split('_')[3]; // ponto_force_close_ID
        await interaction.deferReply({ ephemeral: true });

        const session = (await db.query('SELECT * FROM ponto_sessions WHERE session_id = $1', [sessionId])).rows[0];
        if (!session) {
            return interaction.editReply({ content: '❌ Sessão não encontrada ou já finalizada.' });
        }

        const endTime = new Date();
        const startTime = new Date(session.start_time);
        
        // Calcula duração final
        let durationMs = endTime.getTime() - startTime.getTime() - parseInt(session.total_paused_ms || 0);
        if (session.is_paused && session.last_pause_time) {
            // Se estava pausado ao forçar, desconta o tempo desde a última pausa até agora
            const currentPauseDuration = endTime.getTime() - new Date(session.last_pause_time).getTime();
            durationMs -= currentPauseDuration;
        }
        if (durationMs < 0) durationMs = 0;

        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            // 1. Salva no histórico
            await client.query(
                'INSERT INTO ponto_history (guild_id, user_id, start_time, end_time, duration_ms) VALUES ($1, $2, $3, $4, $5)',
                [session.guild_id, session.user_id, session.start_time, endTime, durationMs]
            );

            // 2. Atualiza Leaderboard
            await client.query(
                `INSERT INTO ponto_leaderboard (guild_id, user_id, total_ms) 
                 VALUES ($1, $2, $3) 
                 ON CONFLICT (guild_id, user_id) 
                 DO UPDATE SET total_ms = ponto_leaderboard.total_ms + $3`,
                [session.guild_id, session.user_id, durationMs]
            );

            // 3. Remove Sessão Ativa
            await client.query('DELETE FROM ponto_sessions WHERE session_id = $1', [sessionId]);

            await client.query('COMMIT');

            // Tenta limpar o intervalo de atualização se o usuário estiver no cache local deste shard
            if (interaction.client.pontoIntervals.has(session.user_id)) {
                clearInterval(interaction.client.pontoIntervals.get(session.user_id));
                interaction.client.pontoIntervals.delete(session.user_id);
            }

            // Tenta avisar o usuário na DM
            try {
                const user = await interaction.client.users.fetch(session.user_id);
                await user.send(`⚠️ **Aviso Administrativo:** Sua sessão de ponto no servidor **${interaction.guild.name}** foi finalizada manualmente por um administrador.`);
            } catch (e) {}

            await interaction.editReply({ content: '✅ Sessão finalizada forçadamente com sucesso e tempo contabilizado.' });
            
            // Tenta atualizar a mensagem original do dashboard para "Finalizado" (opcional, pode falhar se mensagem antiga)
            if (session.dashboard_message_id) {
                try {
                    await interaction.channel.messages.edit(session.dashboard_message_id, { components: [] }); 
                } catch(e) {}
            }

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            await interaction.editReply({ content: '❌ Erro ao finalizar sessão.' });
        } finally {
            client.release();
        }
    }
};