// ui/devPanel/devCommandStatsMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateCommandStatsMenu(stats) {
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

    const rankingText = stats.ranking.map((cmd, index) => {
        return `**${index + 1}.** \`/${cmd.command_name}\` - ${cmd.usage_count} usos`;
    }).join('\n');

    return {
        components: [
            {
                type: 17,
                components: [
                    { type: 10, content: `## 📊 Comandos Mais Utilizados` },
                    { type: 10, content: `> Total de comandos executados: **${stats.total}**` },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 10, content: rankingText || '> Nenhuma estatística de comando encontrada.' },
                    { type: 14, divider: true, spacing: 2 },
                    { type: 1, components: backButton.toJSON().components }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG,
    };
};