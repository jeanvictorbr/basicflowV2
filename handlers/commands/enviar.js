// Crie em: handlers/commands/enviar.js
const { getAIResponse } = require('../../utils/aiAssistant.js');

module.exports = {
    customId: 'enviar',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // 1. Pega as opções que o admin inseriu no comando
        const targetChannel = interaction.options.getChannel('canal');
        const prompt = interaction.options.getString('prompt');
        const userToMention = interaction.options.getUser('mencionar_usuario');

        // 2. Cria as "instruções" para a IA, baseadas no pedido do admin
        const systemPrompt = `Você é um assistente de comunicação para o servidor "${interaction.guild.name}". Sua tarefa é escrever uma mensagem clara e bem formatada, baseada na seguinte instrução de um administrador: "${prompt}"`;

        try {
            // 3. Pede para a IA gerar o texto (sem usar a base de conhecimento, apenas o prompt)
            const aiGeneratedMessage = await getAIResponse(interaction.guild.id, [], prompt, systemPrompt, false);

            if (!aiGeneratedMessage) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar uma mensagem. Tente ser mais específico no seu pedido.' });
            }

            // 4. Monta a mensagem final, adicionando a menção do usuário se ela foi fornecida
            let finalMessage = aiGeneratedMessage;
            if (userToMention) {
                finalMessage = `<@${userToMention.id}>, ${aiGeneratedMessage}`;
            }

            // 5. Envia a mensagem no canal de destino
            await targetChannel.send(finalMessage);

            // 6. Confirma para o admin que a mensagem foi enviada com sucesso
            await interaction.editReply({ content: `✅ Mensagem da IA enviada com sucesso no canal ${targetChannel}!` });

        } catch (error) {
            console.error('[Comando /enviar] Erro ao enviar mensagem da IA:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar enviar a mensagem. Verifique se eu tenho permissões para falar no canal de destino.' });
        }
    }
};