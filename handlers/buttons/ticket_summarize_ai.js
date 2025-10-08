// Substitua o conteúdo em: handlers/buttons/ticket_summarize_ai.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getAIResponse } = require('../../utils/aiAssistant.js');
const hasFeature = require('../../utils/featureCheck.js');
const db = require('../../database.js');

// Cooldown para evitar spam de requisições à IA
const cooldowns = new Map();

module.exports = {
    customId: 'ticket_summarize_ai',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: '❌ Apenas administradores podem usar esta função.', ephemeral: true });
        }

        if (!await hasFeature(interaction.guild.id, 'TICKETS_PREMIUM')) {
            return interaction.reply({ content: 'Esta é uma funcionalidade premium. Ative uma chave para usá-la.', ephemeral: true });
        }
        
        const now = Date.now();
        const userCooldown = cooldowns.get(interaction.user.id);
        if (userCooldown && now < userCooldown) {
            const timeLeft = Math.ceil((userCooldown - now) / 1000);
            return interaction.reply({ content: `⏱️ Por favor, aguarde ${timeLeft} segundos para pedir outra sugestão.`, ephemeral: true });
        }
        cooldowns.set(interaction.user.id, now + 20000);

        await interaction.deferReply({ ephemeral: true });

        try {
            const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            
            const transcript = messages.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');

            // --- CORREÇÃO APLICADA AQUI ---
            // Verifica o tamanho do texto em vez da quantidade de mensagens.
            const MINIMUM_LENGTH = 200; // Mínimo de 200 caracteres para valer a pena resumir.
            if (transcript.length < MINIMUM_LENGTH) {
                return interaction.editReply({ content: 'ℹ️ O conteúdo deste ticket é muito curto para justificar um resumo.' });
            }
            // --- FIM DA CORREÇÃO ---

            const systemPrompt = `
                Você é um especialista em suporte ao cliente. Sua tarefa é ler a transcrição de um ticket de suporte do Discord e criar um resumo claro e conciso para um membro da equipe que acabou de assumir o atendimento.
                Sua resposta DEVE ser um objeto JSON válido com as seguintes chaves em português:
                - "problem": (string) Identifique e descreva em uma frase qual é a principal solicitação ou problema do usuário.
                - "solutions_tried": (string) Liste em formato de tópicos as soluções ou etapas que já foram sugeridas ou tentadas. Se nada foi tentado, escreva "Nenhuma solução foi tentada até o momento".
                - "current_status": (string) Forneça um resumo de 1-2 frases sobre o estado atual da conversa.
                - "user_sentiment": (string) Analise o tom do usuário e descreva seu sentimento (ex: 'Calmo e informativo', 'Frustrado e com pressa', 'Confuso', 'Urgente').

                Seja objetivo e foque em extrair a informação mais relevante para acelerar a resolução do ticket.

                Transcrição do Ticket:
                ---
                ${transcript}
                ---
            `;
            
            const summaryJson = await getAIResponse(interaction.guild.id, [], transcript, systemPrompt, false);
            
            if (!summaryJson) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar um resumo para este ticket. Tente novamente mais tarde.' });
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
                .setFooter({ text: `${messages.size} mensagens analisadas. A decisão final é do moderador.` })
                .setTimestamp();

            await interaction.channel.send({ embeds: [summaryEmbed] });
            await interaction.editReply({ content: '✅ O resumo foi gerado e enviado no ticket para todos verem.' });

        } catch (error) {
            console.error('[Ticket Summarize AI] Erro ao gerar resumo:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro. A IA pode ter retornado um formato inesperado. Verifique os logs.' });
        }
    }
};