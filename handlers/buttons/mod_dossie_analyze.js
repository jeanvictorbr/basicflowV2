// Crie em: handlers/buttons/mod_dossie_analyze.js
const db = require('../../database.js');
const { getAIResponse } = require('../../utils/aiAssistant.js');

module.exports = {
    customId: 'mod_dossie_analyze_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const targetUserId = interaction.customId.split('_')[3];

            // 1. Coleta todo o histórico de punições e notas do banco de dados
            const logsResult = await db.query('SELECT * FROM moderation_logs WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at ASC', [interaction.guild.id, targetUserId]);
            const notesResult = await db.query('SELECT * FROM moderation_notes WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at ASC', [interaction.guild.id, targetUserId]);
            
            if (logsResult.rows.length === 0 && notesResult.rows.length === 0) {
                return interaction.editReply({ content: 'ℹ️ Este usuário não possui histórico de punições ou notas para analisar.' });
            }

            // 2. Formata os dados de forma legível para a IA
            let historyText = "Histórico de Punições:\n";
            logsResult.rows.forEach(log => {
                historyText += `- Ação: ${log.action}, Data: ${new Date(log.created_at).toLocaleDateString('pt-BR')}, Motivo: ${log.reason}\n`;
            });

            if (notesResult.rows.length > 0) {
                historyText += "\nNotas Internas da Staff:\n";
                notesResult.rows.forEach(note => {
                    historyText += `- Nota: ${note.content}, Data: ${new Date(note.created_at).toLocaleDateString('pt-BR')}\n`;
                });
            }

            // 3. Cria o prompt de sistema, instruindo a IA sobre seu papel
            const systemPrompt = `Você é um analista de comportamento e especialista em moderação de comunidades online. Sua tarefa é analisar o histórico de um usuário e descrever seu padrão de comportamento de forma objetiva e concisa (uma ou duas frases). Foque em reincidências, escalada de gravidade ou comportamento isolado. Seja profissional e direto.\n\n--- INÍCIO DO HISTÓRICO ---\n${historyText}\n--- FIM DO HISTÓRICO ---`;

            // 4. Chama a IA para obter a análise
            const analysis = await getAIResponse(interaction.guild.id, [], historyText, systemPrompt, false);

            if (analysis) {
                // 5. Envia a resposta para o moderador que solicitou
                await interaction.editReply({ content: `**🧠 Análise de Comportamento da IA:**\n>>> ${analysis}` });
            } else {
                await interaction.editReply({ content: '⚠️ A IA não conseguiu gerar uma análise para este histórico.' });
            }

        } catch (error) {
            console.error('[AI Dossier Analysis] Erro ao analisar dossiê:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao processar a análise do dossiê.' });
        }
    }
};