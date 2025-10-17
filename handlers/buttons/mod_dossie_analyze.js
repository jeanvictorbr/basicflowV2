// Substitua o conteúdo em: handlers/buttons/mod_dossie_analyze.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');
const { getAIResponse } = require('../../utils/aiAssistant.js');

module.exports = {
    customId: 'mod_dossie_analyze_',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const targetUserId = interaction.customId.split('_')[3];
            const targetUser = await interaction.client.users.fetch(targetUserId);

            const logsResult = await db.query('SELECT * FROM moderation_logs WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at ASC', [interaction.guild.id, targetUserId]);
            const notesResult = await db.query('SELECT * FROM moderation_notes WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at ASC', [interaction.guild.id, targetUserId]);
            
            if (logsResult.rows.length === 0 && notesResult.rows.length === 0) {
                return interaction.editReply({ content: 'ℹ️ Este usuário não possui histórico para analisar.' });
            }

            let historyText = "Histórico de Punições:\n" + logsResult.rows.map(log => `- Ação: ${log.action}, Data: ${new Date(log.created_at).toLocaleDateString('pt-BR')}, Motivo: ${log.reason}`).join('\n');
            if (notesResult.rows.length > 0) {
                historyText += "\n\nNotas Internas da Staff:\n" + notesResult.rows.map(note => `- Nota: ${note.content}, Data: ${new Date(note.created_at).toLocaleDateString('pt-BR')}`).join('\n');
            }

            const systemPrompt = `
                Você é um assistente de moderação especialista chamado Guardian AI. Sua tarefa é analisar o histórico de um usuário e fornecer um relatório estruturado em JSON com as chaves: "pattern", "risk_level", "suggestion".
            `;

            const analysisJson = await getAIResponse({
                guild: interaction.guild,
                user: interaction.user,
                featureName: "Análise de Dossiê",
                chatHistory: [],
                userMessage: historyText,
                customPrompt: systemPrompt,
                useBaseKnowledge: false
            });

            if (!analysisJson) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar uma análise para este histórico.' });
            }

            const result = JSON.parse(analysisJson);
            const { pattern, risk_level, suggestion } = result;

            const riskColors = { "Baixo": "Green", "Moderado": "Yellow", "Alto": "Orange", "Crítico": "Red" };

            const analysisEmbed = new EmbedBuilder()
                .setColor(riskColors[risk_level] || 'Default')
                .setAuthor({ name: `Análise de Comportamento: ${targetUser.tag}`, iconURL: targetUser.displayAvatarURL() })
                .addFields(
                    { name: '🚨 Nível de Risco Avaliado', value: `**${risk_level || 'Indeterminado'}**` },
                    { name: '📈 Padrão de Comportamento Identificado', value: pattern || 'Não foi possível determinar um padrão.' },
                    { name: '💡 Ação Recomendada pela IA', value: suggestion || 'Nenhuma ação específica sugerida.' }
                )
                .setFooter({ text: 'Análise gerada por IA. A decisão final é sempre do moderador.' })
                .setTimestamp();

            await interaction.editReply({ embeds: [analysisEmbed] });

        } catch (error) {
            console.error('[AI Dossier Analysis] Erro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao processar a análise. A IA pode ter retornado um formato inesperado.' });
        }
    }
};