// A lógica aqui deve focar em minimizar chamadas à API
function startPontoUpdateLoop(client) {
    console.log("✅ [Ponto] Loop otimizado iniciado (60s)."); // Aumente o intervalo! 15s é desnecessário.

    setInterval(async () => {
        const activeSessions = await db.query(`
            SELECT * FROM ponto_sessions 
            WHERE status = 'OPEN' 
            AND log_message_id IS NOT NULL 
        `);

        if (activeSessions.rows.length === 0) return;

        // Processamento em lote com um limite de concorrência
        for (const session of activeSessions.rows) {
            // AQUI ESTÁ O PULO DO GATO:
            // Não busque canal/user na API.
            // Apenas edite a mensagem usando o canal que já está no seu cache ou via webhook.
            
            const channel = client.channels.cache.get(session.channel_id); // Use o cache, não o fetch!
            if (!channel) continue;

            const message = await channel.messages.fetch(session.log_message_id).catch(() => null);
            if (!message) continue;

            // Gera o payload sem precisar buscar o objeto User da API
            const updatedPayload = generateLogUI(session, { id: session.user_id }); 
            
            // Só edita se for estritamente necessário (compare hashes ou timestamps)
            await message.edit(updatedPayload).catch(e => console.error("Erro na edição:", e));
        }
    }, 60000); // 60 segundos é mais que suficiente para um log de ponto
}