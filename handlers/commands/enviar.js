// Substitua completamente o conteúdo em: handlers/commands/enviar.js
const { getAIResponse } = require('../../utils/aiAssistant.js');

/**
 * Divide uma string em pedaços menores que um tamanho máximo,
 * tentando quebrar em novas linhas ou espaços para manter a formatação.
 * @param {string} text O texto a ser dividido.
 * @param {number} maxLength O comprimento máximo de cada pedaço.
 * @returns {string[]} Um array de pedaços de texto.
 */
function splitMessage(text, maxLength = 2000) {
    if (text.length <= maxLength) {
        return [text];
    }

    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');
    for (const line of lines) {
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = '';
        }

        // Se uma única linha for maior que o limite, quebramos ela à força
        if (line.length > maxLength) {
            let tempLine = line;
            while (tempLine.length > 0) {
                if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                const slice = tempLine.substring(0, maxLength);
                chunks.push(slice);
                tempLine = tempLine.substring(maxLength);
            }
        } else {
            if (currentChunk.length > 0) {
                currentChunk += '\n';
            }
            currentChunk += line;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    return chunks;
}


module.exports = {
    customId: 'enviar',
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetChannel = interaction.options.getChannel('canal');
        const prompt = interaction.options.getString('prompt');
        const userToMention = interaction.options.getUser('mencionar_usuario');

        const systemPrompt = `Aja como um redator. Sua única tarefa é escrever um texto para ser enviado em um canal do Discord, seguindo estritamente a instrução de um administrador. Não adicione nenhuma introdução, saudação ou qualquer texto seu. Responda apenas com o conteúdo solicitado. A instrução é: "${prompt}"`;

        try {
            const aiGeneratedMessage = await getAIResponse({
                guild: interaction.guild,
                user: interaction.user,
                featureName: 'enviar',
                userMessage: prompt,
                customPrompt: systemPrompt,
                useBaseKnowledge: false,
                chatHistory: []
            });

            if (!aiGeneratedMessage) {
                return interaction.editReply({ content: '❌ A IA não conseguiu gerar uma mensagem. Tente ser mais específico no seu pedido.' });
            }

            let initialMessage = aiGeneratedMessage.replace(/^"|"$/g, '');
            let mentionPrefix = '';
            if (userToMention) {
                mentionPrefix = `<@${userToMention.id}>, `;
            }

            // --- INÍCIO DA LÓGICA DE DIVISÃO ---
            const messageChunks = splitMessage(initialMessage, 1990); // 1990 para dar margem de segurança

            // Envia o primeiro pedaço com a menção (se houver)
            await targetChannel.send(mentionPrefix + messageChunks[0]);

            // Envia os pedaços restantes em sequência
            for (let i = 1; i < messageChunks.length; i++) {
                // Adiciona um pequeno delay para garantir a ordem das mensagens
                await new Promise(resolve => setTimeout(resolve, 500));
                await targetChannel.send(messageChunks[i]);
            }
            // --- FIM DA LÓGICA DE DIVISÃO ---

            await interaction.editReply({ content: `✅ Mensagem da IA enviada com sucesso no canal ${targetChannel}!` });

        } catch (error) {
            console.error('[Comando /enviar] Erro ao enviar mensagem da IA:', error);
            await interaction.editReply({ content: '❌ Ocorreu um erro ao tentar enviar a mensagem. Verifique se eu tenho permissões para falar no canal de destino.' });
        }
    }
};