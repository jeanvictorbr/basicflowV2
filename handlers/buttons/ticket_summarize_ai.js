// Crie em: handlers/buttons/ticket_summarize_ai.js
const { EmbedBuilder } = require('discord.js');
const { getAIResponse } = require('../../utils/aiAssistant.js');
const hasFeature = require('../../utils/featureCheck.js');

module.exports = {
    customId: 'ticket_summarize_ai',
    async execute(interaction) {
        // 1. Verifica se a funcionalidade é premium
        if (!await hasFeature(interaction.guild.id, 'TICKETS_PREMIUM')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // 2. Busca o histórico completo de mensagens do ticket
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            if (messages.size < 3) {
                return interaction.editReply({ content: 'ℹ️ Não há mensagens suficientes neste ticket para justificar um resumo.' });
            }

            const transcript = messages.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');

            // 3. Cria um prompt de sistema detalhado para a IA
            const systemPrompt = `
                Você é um especialista em suporte ao cliente. Sua tarefa é ler a transcrição de um ticket de suporte do Discord e criar um resumo claro e conciso para um membro da equipe que acabou de assumir o atendimento.
                Sua resposta DEVE ser um relatório com três seções distintas:

                1.  **Problema Principal:** Identifique e descreva em uma frase qual é a principal solicitação ou problema do usuário.
                2.  **Soluções Tentadas:** Liste em formato de tópicos (bullet points) as soluções ou etapas que já foram sugeridas ou tentadas, tanto pelo usuário quanto por outros membros da equipe. Se nada foi tentado, escreva "Nenhuma solução foi tentada até o momento".
                3.  **Resumo Geral:** Forneça um resumo de 1-2 frases sobre o estado atual da conversa e o que o usuário está a aguardar.

                Seja objetivo e foque em extrair a informação mais relevante para acelerar a resolução do ticket.

                Transcrição do Ticket:
                ---
                ${transcript}
                ---
            `;

            // 4. Chama a IA para gerar o resumo
            const summary = await getAIResponse(interaction.guild.id, [], transcript, systemPrompt, false);

            if (!summary) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar um resumo para este ticket. Tente novamente mais tarde.' });
            }

            // 5. Formata e envia a resposta em um embed
            const summaryEmbed = new EmbedBuilder()
                .setColor('Gold')
                .setTitle('🧠 Resumo do Ticket Gerado por IA')
                .setDescription(summary)
                .setFooter({ text: `Resumo solicitado por: ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.editReply({ embeds: [summaryEmbed] });

        } catch (error) {
            console.error('[Ticket Summarize AI] Erro ao gerar resumo:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar buscar as mensagens e gerar o resumo.' });
        }
    }
};