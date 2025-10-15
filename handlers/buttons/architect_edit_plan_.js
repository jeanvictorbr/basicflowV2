// Crie em: handlers/buttons/architect_edit_plan_.js
const db = require('../../database.js');

module.exports = {
    customId: 'architect_edit_plan_',
    async execute(interaction) {
        await interaction.message.delete();
        const sessionId = interaction.customId.replace('architect_edit_plan_', '');

        try {
            // Reativa a sessão de conversa
            await db.query("UPDATE architect_sessions SET status = 'active' WHERE channel_id = $1", [sessionId]);

            // Pega o histórico e o último plano para dar contexto à IA
            const sessionResult = await db.query('SELECT chat_history, blueprint FROM architect_sessions WHERE channel_id = $1', [sessionId]);
            const session = sessionResult.rows[0];
            const chatHistory = session.chat_history || [];
            const lastBlueprint = session.blueprint;

            // Adiciona o contexto da edição ao histórico
            if (lastBlueprint) {
                chatHistory.push({
                    role: 'assistant',
                    content: `O último plano que eu sugeri foi este: \`\`\`json\n${JSON.stringify(lastBlueprint, null, 2)}\n\`\`\``
                });
                chatHistory.push({
                    role: 'user',
                    content: 'Eu gostaria de fazer algumas alterações nesse plano.'
                });
                await db.query('UPDATE architect_sessions SET chat_history = $1 WHERE channel_id = $2', [JSON.stringify(chatHistory), sessionId]);
            }

            await interaction.channel.send("Entendido. O plano foi descartado por enquanto. Vamos continuar a conversa. O que você gostaria de alterar ou adicionar?");

        } catch (error) {
            console.error('[Arquiteto Edit Plan] Erro:', error);
            await interaction.channel.send('❌ Ocorreu um erro ao tentar reabrir a sessão para edição.');
        }
    }
};