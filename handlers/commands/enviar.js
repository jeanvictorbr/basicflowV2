// handlers/commands/enviar.js
const { getAIResponse } = require('../../utils/aiAssistant.js');

module.exports = {
    customId: 'enviar',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetChannel = interaction.options.getChannel('canal');
        const prompt = interaction.options.getString('prompt');
        const userToMention = interaction.options.getUser('mencionar_usuario');

        // --- PROMPT CORRIGIDO ---
        // Agora, a instrução para a IA é direta e exige que ela não adicione texto extra.
        const systemPrompt = `Aja como um redator. Sua única tarefa é escrever um texto para ser enviado em um canal do Discord, seguindo estritamente a instrução de um administrador. Não adicione nenhuma introdução, saudação ou qualquer texto seu. Responda apenas com o conteúdo solicitado. A instrução é: "${prompt}"`;

        try {
            const aiGeneratedMessage = await getAIResponse(interaction.guild.id, [], prompt, systemPrompt, false);

            if (!aiGeneratedMessage) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar uma mensagem. Tente ser mais específico no seu pedido.' });
            }

            let finalMessage = aiGeneratedMessage;
            if (userToMention) {
                // Remove aspas da mensagem gerada pela IA, caso existam
                const cleanMessage = aiGeneratedMessage.replace(/^"|"$/g, '');
                finalMessage = `<@${userToMention.id}>, ${cleanMessage}`;
            }

            await targetChannel.send(finalMessage);

            await interaction.editReply({ content: `✅ Mensagem da IA enviada com sucesso no canal ${targetChannel}!` });

        } catch (error) {
            console.error('[Comando /enviar] Erro ao enviar mensagem da IA:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar enviar a mensagem. Verifique se eu tenho permissões para falar no canal de destino.' });
        }
    }
};