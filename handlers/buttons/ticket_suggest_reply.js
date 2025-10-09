// Substitua o conteúdo em: handlers/buttons/ticket_suggest_reply.js
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getAIResponse } = require('../../utils/aiAssistant.js');
const hasFeature = require('../../utils/featureCheck.js');

const cooldowns = new Map();

module.exports = {
    customId: 'ticket_suggest_reply',
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
            const messages = await interaction.channel.messages.fetch({ limit: 50 });
            const lastUserMessage = messages.find(m => !m.author.bot && !m.member.permissions.has(PermissionsBitField.Flags.Administrator));

            if (!lastUserMessage) {
                return interaction.editReply({ content: 'ℹ️ Não encontrei uma mensagem de cliente para analisar.' });
            }

            const systemPrompt = `
                Você é um assistente de suporte especialista. Sua tarefa é ler a última mensagem de um cliente em um ticket e sugerir uma única frase de abertura para o moderador.
                A resposta deve ser empática, profissional e, se apropriado, pedir mais informações.
                Responda APENAS com o texto da sugestão, sem nenhuma introdução como "Claro, aqui está a sugestão:".

                Exemplos:
                - Se o usuário diz "meu carro explodiu e perdi tudo", sugira: "Lamento ouvir sobre o problema com o seu veículo. Para investigarmos, poderia fornecer a placa e um clipe do ocorrido?"
                - Se o usuário diz "não consigo conectar", sugira: "Olá! Para te ajudar com o seu problema de conexão, poderia me dizer qual erro aparece na sua tela?"
                - Se o usuário diz "fui roubado", sugira: "Entendo a situação. Para darmos seguimento, por favor, nos informe o ID do suspeito e envie um vídeo que mostre o ocorrido."

                Última mensagem do cliente: "${lastUserMessage.content}"
            `;

            const suggestion = await getAIResponse({
                guild: interaction.guild,
                user: interaction.user,
                featureName: "Sugestão de Resposta",
                chatHistory: [],
                userMessage: lastUserMessage.content,
                customPrompt: systemPrompt,
                useBaseKnowledge: false
            });

            if (!suggestion) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar uma sugestão. Tente novamente.' });
            }

            const suggestionEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setAuthor({ name: 'Sugestão de Resposta Rápida', iconURL: interaction.client.user.displayAvatarURL() })
                .setDescription(`"${suggestion}"`)
                .setFooter({ text: 'Esta sugestão foi gerada por IA.' });

            await interaction.editReply({ embeds: [suggestionEmbed] });

        } catch (error) {
            console.error('[Ticket Suggest AI] Erro ao gerar sugestão:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao processar a sua solicitação.' });
        }
    }
};