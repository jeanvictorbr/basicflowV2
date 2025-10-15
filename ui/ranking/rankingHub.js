// ui/ranking/rankingHub.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateRankingHub() {
    const V2_FLAG = 1 << 15;
    const EPHEMERAL_FLAG = 1 << 6;

    return {
        components: [
            {
                type: 17, // Rich Content
                accent_color: 15844367, // Gold
                components: [
                    { type: 10, content: "## 🏆 Central de Rankings" },
                    { type: 10, content: "> Navegue pelos placares de líderes do seu servidor ou compare seu desempenho com jogadores de todas as comunidades!" },
                    { type: 14, divider: true, spacing: 2 },
                    {
                        type: 1, // Action Row
                        components: [
                            new ButtonBuilder().setCustomId('ranking_show_local').setLabel('Ver Ranking Local').setStyle(ButtonStyle.Primary).setEmoji('🏠').toJSON(),
                            new ButtonBuilder().setCustomId('ranking_show_global').setLabel('Ver Ranking Global').setStyle(ButtonStyle.Secondary).setEmoji('🌍').toJSON()
                        ]
                    }
                ]
            }
        ],
        flags: V2_FLAG | EPHEMERAL_FLAG
    };
};