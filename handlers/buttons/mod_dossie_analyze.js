// Substitua o conteúdo em: handlers/buttons/mod_dossie_analyze.js
const db = require('../../database.js');
const { EmbedBuilder } = require('discord.js');
const { OpenAI } = require('openai');
require('dotenv').config();

// Inicializa o cliente da OpenAI (necessário para forçar a resposta em JSON)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
                return interaction.editReply({ content: 'ℹ️ Este usuário não possui histórico de punições ou notas para analisar.' });
            }

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

            const systemPrompt = `
                Você é um assistente de moderação especialista chamado Guardian AI. Sua tarefa é analisar o histórico de um usuário e fornecer um relatório estruturado para o moderador humano.
                O histórico inclui punições e notas internas.
                Sua resposta DEVE ser um objeto JSON válido com as seguintes chaves, em português:
                - "pattern": (string) Um resumo conciso do padrão de comportamento do usuário (ex: "Reincidência de toxicidade em chats de voz", "Infrações isoladas e de baixa gravidade com longo tempo entre elas").
                - "risk_level": (string) Uma classificação do nível de risco: "Baixo", "Moderado", "Alto", ou "Crítico".
                - "suggestion": (string) Uma sugestão de ação clara e objetiva para o moderador (ex: "Aplicar um silenciamento de 24h para quebrar o padrão de reincidência.", "Considerar banimento permanente devido à escalada de gravidade.", "Apenas continuar a monitorar, pois o comportamento não é recorrente.").

                Analise a frequência, a gravidade (Ban > Kick > Timeout > Warn) e o tempo entre as infrações. Uma escalada na gravidade das punições é um forte indicador de risco elevado.

                Histórico do Usuário a ser analisado:
                ${historyText}
            `;

            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'system', content: systemPrompt }],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0].message.content);
            const { pattern, risk_level, suggestion } = result;

            const riskColors = {
                "Baixo": "Green",
                "Moderado": "Yellow",
                "Alto": "Orange",
                "Crítico": "Red"
            };

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
            console.error('[AI Dossier Analysis] Erro ao analisar dossiê:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao processar a análise do dossiê. A IA pode ter demorado a responder ou retornado uma resposta em formato inválido.' });
        }
    }
};