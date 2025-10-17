// handlers/buttons/mod_dossie_analyze.js
const { EmbedBuilder } = require('discord.js');
const db = require('../../database');
const { getAIResponse } = require('../../utils/aiAssistant');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_dossie_analyze',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const embed = interaction.message.embeds[0];
        if (!embed) {
            return interaction.editReply({ content: 'Não foi possível encontrar o embed original do dossiê.' });
        }

        const userId = embed.footer.text.replace('ID do Usuário: ', '');
        const guildId = interaction.guild.id;

        try {
            const logsResult = await db.query('SELECT * FROM moderation_logs WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC', [guildId, userId]);
            const notesResult = await db.query('SELECT * FROM moderation_notes WHERE guild_id = $1 AND user_id = $2 ORDER BY created_at DESC', [guildId, userId]);

            const logs = logsResult.rows;
            const notes = notesResult.rows;

            if (logs.length === 0 && notes.length === 0) {
                return interaction.editReply({ content: 'Este usuário não possui registros para analisar.' });
            }

            const historyText = logs.map(l => `- Ação: ${l.action}, Motivo: ${l.reason}, Data: ${l.created_at.toISOString()}`).join('\n');
            const notesText = notes.map(n => `- Nota: ${n.content}, Data: ${n.created_at.toISOString()}`).join('\n');
            const fullHistory = `Histórico de Punições:\n${historyText}\n\nNotas Internas:\n${notesText}`;

            const prompt = `
                Você é um especialista em moderação do Discord. Analise o seguinte histórico de um usuário e forneça uma análise concisa em formato JSON.
                **Histórico:**
                ${fullHistory}
                
                **Formato de Resposta JSON OBRIGATÓRIO:**
                \`\`\`json
                {
                  "behavior_pattern": "Descreva o padrão de comportamento do usuário (ex: 'reincidente em spam', 'conflitos recorrentes', 'infrações leves e esporádicas').",
                  "severity_level": "Classifique a severidade geral do histórico (ex: 'Baixa', 'Moderada', 'Alta', 'Crítica').",
                  "recommendation": "Sugira uma ação ou postura para os moderadores (ex: 'Monitoramento padrão', 'Atenção redobrada em canais de voz', 'Próxima infração deve resultar em banimento temporário')."
                }
                \`\`\`
            `;

            const aiResponse = await getAIResponse({
                guild: interaction.guild,
                user: interaction.user,
                featureName: 'Análise de Dossiê (IA)',
                userMessage: prompt,
                customPrompt: '',
                useBaseKnowledge: false
            });

            // --- INÍCIO DA CORREÇÃO ---
            let analysisEmbed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle(`🤖 Análise de IA do Dossiê`)
                .setFooter({ text: `Análise para o usuário ${userId}`});

            const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

            if (jsonMatch && jsonMatch[1]) {
                try {
                    const analysis = JSON.parse(jsonMatch[1]);
                    analysisEmbed.addFields(
                        { name: 'Padrão de Comportamento', value: analysis.behavior_pattern || 'Não identificado' },
                        { name: 'Nível de Severidade', value: analysis.severity_level || 'Não classificado' },
                        { name: 'Recomendação', value: analysis.recommendation || 'Nenhuma sugestão' }
                    );
                } catch (e) {
                    // Se o JSON dentro do bloco for inválido, mostra a resposta bruta.
                    analysisEmbed.setDescription(`A IA retornou um JSON mal formatado. Resposta recebida:\n\`\`\`${aiResponse}\`\`\``);
                }
            } else {
                // Se não houver bloco JSON, trata como texto simples.
                analysisEmbed.setDescription(aiResponse || 'A IA não forneceu uma análise.');
            }
            // --- FIM DA CORREÇÃO ---

            await interaction.editReply({ embeds: [analysisEmbed], ephemeral: true });

        } catch (error) {
            console.error('[AI Dossier Analysis] Erro:', error);
            await interaction.editReply({ content: 'Ocorreu um erro ao tentar analisar o dossiê com a IA.', ephemeral: true });
        }
    }
};