// ui/devPanel/devErrorLogViewer.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { splitMessage } = require('../../utils/messageSplitter');

module.exports = function generateErrorLogViewer(logContent, numLines) {
    const V2_FLAG = 1 << 15;
    const EPHEMERAL_FLAG = 1 << 6;

    const backButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('dev_open_health_check') // Botão para voltar
                .setLabel('Voltar para Saúde do Sistema')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('↩️')
        );

    // Garante que o conteúdo do log não ultrapasse o limite do Discord
    const logChunks = splitMessage(logContent, { maxLength: 4000, char: '\n', append: '\n...' });

    return {
        components: [
            {
                type: 17,
                components: [
                    { type: 10, content: `## 📄 Últimas ${numLines} Linhas do Log de Erros` },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 10, content: `\`\`\`${logChunks[0]}\`\`\`` },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 1, components: backButton.toJSON().components }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};