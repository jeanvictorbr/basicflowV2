const db = require('../database.js');

/**
 * Função que roda ao iniciar o bot para corrigir o Ranking globalmente.
 * Ela apaga o ranking atual (viciado) e recria baseado no histórico real de sessões.
 */
async function autoFixGlobalRanking() {
    console.log("🔧 [AutoFix] Verificando integridade do Ranking de Ponto...");
    
    try {
        // 1. Limpa a tabela de ranking inteira (Remove todos os negativos/bugados de todos os servidores)
        // TRUNCATE é mais rápido que DELETE para limpar tudo
        await db.query("TRUNCATE TABLE ponto_leaderboard");

        // 2. Reconstrói o Ranking do Zero (Globalmente)
        // Esta query pega TODAS as sessões fechadas de TODAS as guilds e soma o tempo correto.
        const result = await db.query(`
            INSERT INTO ponto_leaderboard (guild_id, user_id, total_ms)
            SELECT 
                guild_id, 
                user_id, 
                SUM(
                    GREATEST(0, 
                        (EXTRACT(EPOCH FROM end_time) * 1000) - 
                        (EXTRACT(EPOCH FROM start_time) * 1000) - 
                        COALESCE(total_paused_ms, 0)
                    )
                ) as total_recalculado
            FROM ponto_sessions
            WHERE status = 'CLOSED' 
              AND end_time IS NOT NULL
            GROUP BY guild_id, user_id;
        `);

        console.log(`✅ [AutoFix] Sucesso Absoluto! Ranking recalculado.`);
        console.log(`📊 [AutoFix] ${result.rowCount} usuários tiveram seus tempos corrigidos em todos os servidores.`);

    } catch (error) {
        console.error("❌ [AutoFix] Erro crítico ao tentar corrigir o ranking:", error);
    }
}

module.exports = { autoFixGlobalRanking };