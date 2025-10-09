// Substitua o conteúdo em: handlers/buttons/ticket_summarize_ai.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getAIResponse } = require('../../utils/aiAssistant.js');
const hasFeature = require('../../utils/featureCheck.js');
const db = require('../../database.js');

module.exports = {
    customId: 'ticket_summarize_ai',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Apenas administradores podem usar esta função.', ephemeral: true });
        }

        if (!await hasFeature(interaction.guild.id, 'TICKETS_PREMIUM')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            
            const transcript = messages.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');
            
            const MINIMUM_LENGTH = 200;
            if (transcript.length < MINIMUM_LENGTH) {
                return interaction.editReply({ content: 'ℹ️ O conteúdo deste ticket é muito curto para justificar um resumo.' });
            }

            const systemPrompt = `
                Você é um especialista em suporte ao cliente. Sua tarefa é ler a transcrição de um ticket e criar um resumo JSON.
                Sua resposta DEVE ser um objeto JSON válido com as chaves: "problem", "solutions_tried", "current_status", "user_sentiment".
            `;
            
            const summaryJson = await getAIResponse({
                guild: interaction.guild,
                user: interaction.user,
                featureName: "Resumo de Ticket",
                chatHistory: [],
                userMessage: transcript,
                customPrompt: systemPrompt,
                useBaseKnowledge: false
            });
            
            if (!summaryJson) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar um resumo para este ticket.' });
            }

            const result = JSON.parse(summaryJson);

            const summaryEmbed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ name: 'Análise de Ticket por IA', iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle(`🧠 Resumo do Ticket #${String(ticketData.ticket_number).padStart(4, '0')}`)
                .addFields(
                    { name: '🎯 Problema Principal', value: result.problem || 'Não identificado.' },
                    { name: '🤔 Sentimento do Usuário', value: `*${result.user_sentiment || 'Neutro.'}*`, inline: true },
                    { name: '🗣️ Aberto por', value: `<@${ticketData.user_id}>`, inline: true },
                    { name: '🛠️ Soluções Tentadas', value: result.solutions_tried || 'Nenhuma.' },
                    { name: '⏳ Status Atual', value: result.current_status || 'Aguardando resposta.' }
                )
                .setFooter({ text: `${messages.size} mensagens analisadas.` })
                .setTimestamp();

            await interaction.channel.send({ embeds: [summaryEmbed] });
            await interaction.editReply({ content: '✅ O resumo foi gerado e enviado no ticket.' });

        } catch (error) {
            console.error('[Ticket Summarize AI] Erro:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro. A IA pode ter retornado um formato inesperado.' });
        }
    }
};