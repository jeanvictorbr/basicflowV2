// Substitua o conteúdo em: handlers/buttons/ticket_summarize_ai.js
const { getAIResponse } = require('../../utils/aiAssistant.js');
const { EmbedBuilder } = require('discord.js');

// Função para extrair o JSON de uma string de forma segura
function extractJsonFromString(str) {
    const match = str.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (match) {
        // Prioriza o bloco de código JSON, senão tenta o objeto direto
        return match[1] || match[2];
    }
    return null;
}

module.exports = {
    customId: 'ticket_summarize_ai',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const transcript = messages.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');

        const prompt = `
            Analise a transcrição deste ticket de suporte e resuma-o em um formato JSON.
            O JSON deve ter as seguintes chaves: "problema_principal", "solucao_sugerida" e "sentimento_cliente".
            - "problema_principal": Uma string curta descrevendo o problema central do cliente.
            - "solucao_sugerida": Uma string descrevendo a solução encontrada ou sugerida. Se não houver, indique "Nenhuma solução encontrada".
            - "sentimento_cliente": Uma única palavra descrevendo o sentimento do cliente (ex: "Frustrado", "Satisfeito", "Confuso", "Neutro").
            - "participantes": Um array de strings com os nomes dos participantes da conversa, excluindo o bot.

            Transcrição:
            \`\`\`
            ${transcript}
            \`\`\`

            Responda APENAS com o objeto JSON.
        `;

        const aiResponse = await getAIResponse({
            guild: interaction.guild,
            user: interaction.user,
            featureName: 'Resumo de Ticket',
            userMessage: transcript,
            customPrompt: prompt
        });

        if (!aiResponse) {
            return interaction.editReply('❌ A IA não conseguiu gerar um resumo para este ticket.');
        }

        try {
            // CORREÇÃO: Usa a função de extração segura
            const jsonString = extractJsonFromString(aiResponse);
            if (!jsonString) {
                throw new Error("Nenhum JSON válido encontrado na resposta da IA.");
            }
            const summary = JSON.parse(jsonString);

            const summaryEmbed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('🤖 Resumo do Ticket por IA')
                .addFields(
                    { name: 'Problema Principal', value: summary.problema_principal || 'Não identificado' },
                    { name: 'Solução Sugerida', value: summary.solucao_sugerida || 'Não identificada' },
                    { name: 'Sentimento do Cliente', value: summary.sentimento_cliente || 'Não identificado', inline: true },
                    { name: 'Participantes', value: summary.participantes?.join(', ') || 'Ninguém', inline: true }
                )
                .setFooter({ text: 'Este resumo foi gerado por IA e pode conter imprecisões.' });

            await interaction.editReply({ embeds: [summaryEmbed], ephemeral: false });

        } catch (error) {
            console.error('[Ticket Summarize AI] Erro:', error);
            await interaction.editReply({ 
                content: `❌ Ocorreu um erro ao processar o resumo da IA. Resposta recebida:\n\`\`\`${aiResponse}\`\`\``,
                ephemeral: true 
            });
        }
    }
};