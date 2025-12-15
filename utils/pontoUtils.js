/**
 * utils/pontoUtils.js
 * Versão Blindada contra NaN
 */

function parseToMs(value) {
    if (!value) return 0;
    
    let ms;
    if (value instanceof Date) {
        ms = value.getTime();
    } else if (typeof value === 'string') {
        // Tenta converter string ISO
        const d = new Date(value);
        ms = d.getTime();
    } else if (typeof value === 'number') {
        ms = value;
    }

    // Se a conversão falhou (NaN), retorna 0 ou timestamp atual como fallback seguro
    if (!ms || isNaN(ms)) return 0; 
    return ms;
}

function calculateSessionTime(session) {
    const now = Date.now();
    
    const startTimeMs = parseToMs(session.start_time);
    const lastPauseMs = parseToMs(session.last_pause_time);
    const endTimeMs = parseToMs(session.end_time);
    
    // Garante que pausas sejam números (converte de string do banco se necessário)
    const totalPausedMs = parseInt(session.total_paused_ms || session.total_pause_duration || 0);

    let totalElapsed = 0;

    // Se start_time for inválido (0), não tem como calcular
    if (startTimeMs > 0) {
        if (session.status === 'CLOSED' && endTimeMs > 0) {
            totalElapsed = endTimeMs - startTimeMs;
        } else {
            // Aberto
            if (session.is_paused) {
                // Se lastPauseMs for inválido, assume Agora para não travar
                const stopPoint = lastPauseMs > 0 ? lastPauseMs : now;
                totalElapsed = stopPoint - startTimeMs;
            } else {
                totalElapsed = now - startTimeMs;
            }
        }
    }

    const liquidTime = Math.max(0, totalElapsed - totalPausedMs);

    const seconds = Math.floor((liquidTime / 1000) % 60);
    const minutes = Math.floor((liquidTime / (1000 * 60)) % 60);
    const hours = Math.floor((liquidTime / (1000 * 60 * 60)));

    // Fallback para exibição do Discord: Se startTimeMs for 0, usa o now para não mostrar NaN
    const discordTimestamp = startTimeMs > 0 ? Math.floor(startTimeMs / 1000) : Math.floor(now / 1000);

    return {
        durationMs: liquidTime,
        hours,
        minutes,
        seconds,
        formatted: `${hours}h ${minutes}m ${seconds}s`,
        startTimestamp: discordTimestamp // Agora garantido ser um número válido
    };
}

module.exports = { calculateSessionTime };