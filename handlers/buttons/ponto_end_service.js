const { EmbedBuilder } = require('discord.js');
const db = require('../../database.js');
const { updatePontoPainel } = require('../../ui/pontoPainel');
// Importando o utils para garantir a formatação padrão do seu sistema
const { formatDuration } = require('../../utils/pontoUtils.js'); 

module.exports = {
    customId: 'ponto_end_service',

    async execute(interaction) {
        // 1. BLINDAGEM: Evita duplo clique
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        try {
            // 2. BUSCA SESSÃO ABERTA (Sem usar ID)
            // Usamos user_id + guild_id + end_time IS NULL para achar a única sessão ativa
            const sessionRes = await db.query(`
                SELECT start_time, total_pause_ms, last_pause_start, status 
                FROM ponto_sessions 
                WHERE user_id = $1 AND guild_id = $2 AND end_time IS NULL
            `, [userId, guildId]);

            if (sessionRes.rows.length === 0) {
                return interaction.editReply({ content: "❌ Nenhuma sessão ativa encontrada para finalizar." });
            }

            const session = sessionRes.rows[0];
            const now = new Date();
            
            // ==================================================================================
            // 3. CÁLCULO PRECISO DO TEMPO
            // ==================================================================================
            let currentTotalPause = parseInt(session.total_pause_ms) || 0;

            // Se o status atual é PAUSADO, precisamos somar o tempo dessa última pausa até agora
            if (session.status === 'PAUSADO' && session.last_pause_start) {
                const pauseStart = new Date(session.last_pause_start);
                const currentPauseDuration = now - pauseStart;
                currentTotalPause += currentPauseDuration;
            }

            // Tempo Total Líquido = (Agora - Início) - Todas as Pausas
            const startTime = new Date(session.start_time);
            let finalTotalMs = (now - startTime) - currentTotalPause;

            // Segurança: Tempo nunca pode ser negativo
            if (finalTotalMs < 0) finalTotalMs = 0;
            // ==================================================================================

            // 4. FECHAR SESSÃO NO BANCO (Usando WHERE user_id/guild_id/end_time)
            await db.query(`
                UPDATE ponto_sessions 
                SET end_time = NOW(), 
                    status = 'FECHADO',
                    total_pause_ms = $1
                WHERE user_id = $2 AND guild_id = $3 AND end_time IS NULL
            `, [currentTotalPause, userId, guildId]);

            // 5. ATUALIZAR O RANKING (ponto_leaderboard)
            await db.query(`
                INSERT INTO ponto_leaderboard (user_id, guild_id, total_ms, last_updated)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (user_id, guild_id) 
                DO UPDATE SET 
                    total_ms = ponto_leaderboard.total_ms + $3,
                    last_updated = NOW()
            `, [userId, guildId, finalTotalMs]);

            // 6. REMOVER CARGO (Se configurado)
            try {
                const config = await db.query('SELECT cargo_servico_id FROM ponto_config WHERE guild_id = $1', [guildId]);
                if (config.rows.length > 0 && config.rows[0].cargo_servico_id) {
                    const roleId = config.rows[0].cargo_servico_id;
                    const member = await interaction.guild.members.fetch(userId).catch(() => null);
                    if (member && member.roles.cache.has(roleId)) {
                        await member.roles.remove(roleId).catch(err => console.log(`[Ponto] Erro ao remover cargo: ${err.message}`));
                    }
                }
            } catch (roleErr) {
                console.error("[Ponto] Erro não crítico ao remover cargo:", roleErr);
            }

            // 7. ATUALIZA O PAINEL
            await updatePontoPainel(interaction, userId);

            // 8. RESPOSTA FINAL
            let timeString;
            try {
                timeString = formatDuration(finalTotalMs); 
            } catch (e) {
                const h = Math.floor(finalTotalMs / 3600000);
                const m = Math.floor((finalTotalMs % 3600000) / 60000);
                timeString = `${h}h ${m}m`;
            }

            await interaction.editReply({ 
                content: `🛑 **Serviço Finalizado!**\n⏱️ Tempo computado: **${timeString}**\n✅ Adicionado ao Ranking Global.` 
            });

        } catch (error) {
            console.error("Erro crítico ao finalizar serviço:", error);
            if (!interaction.replied) {
                await interaction.editReply({ content: "❌ Ocorreu um erro interno ao salvar seus dados." });
            }
        }
    }
};