// Crie em: ui/devPanel/devGuildFeaturesMenu.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = function generateDevGuildFeaturesMenu(guildId, activeFeatures = []) {
    
    const featureComponents = activeFeatures.length > 0
        ? activeFeatures.flatMap(feature => {
            const actionRow = {
                type: 1, // Action Row
                components: [
                    { type: 2, style: ButtonStyle.Secondary, label: "Editar Validade", custom_id: `dev_guild_edit_feature_validity_${guildId}_${feature.feature_key}`, emoji: { name: "📅" } },
                    { type: 2, style: ButtonStyle.Danger, label: "Remover", custom_id: `dev_guild_remove_feature_${guildId}_${feature.feature_key}`, emoji: { name: "🗑️" } }
                ]
            };

            return [
                { type: 10, content: `**✨ ${feature.feature_key}**` },
                { type: 10, content: `> **Expira em:** <t:${Math.floor(new Date(feature.expires_at).getTime() / 1000)}:f>` },
                actionRow,
                { type: 14, divider: true, spacing: 1 }
            ];
        })
        : [{ type: 10, content: '> Nenhuma feature ativa no momento.' }];

    if (featureComponents.length > 1 && featureComponents[featureComponents.length - 1].type === 14) {
        featureComponents.pop();
    }

    return [
        {
            type: 17, "accent_color": 1146986,
            "components": [
                { type: 10, "content": "## ✨ Gerenciador de Features da Guilda" },
                { type: 10, "content": "> Adicione, remova ou altere a validade de features individuais para esta guilda." },
                { type: 14, "divider": true, "spacing": 1 },
                ...featureComponents,
                { type: 14, "divider": true, "spacing": 2 },
                {
                    "type": 1, components: [
                        { type: 2, style: ButtonStyle.Success, label: "Adicionar Nova Feature", emoji: { name: "➕" }, "custom_id": `dev_guild_add_new_feature_${guildId}` },
                        // CORREÇÃO APLICADA AQUI: O custom_id agora é 'dev_manage_guilds'
                        { type: 2, style: ButtonStyle.Secondary, label: "Voltar", emoji: { name: "↩️" }, "custom_id": `dev_manage_guilds` }
                    ]
                }
            ]
        }
    ];
};