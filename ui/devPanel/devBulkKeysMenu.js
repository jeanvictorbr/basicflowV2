// Crie em: ui/devPanel/devBulkKeysMenu.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const FEATURES = require('../../config/features.js');

module.exports = function generateDevBulkKeysMenu() {
    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_dev_bulk_keys_features')
        .setPlaceholder('Selecione as features para o lote de chaves')
        .setMinValues(1)
        .setMaxValues(FEATURES.length)
        .addOptions(FEATURES);

    return [
        {
            "type": 17, "accent_color": 15844367,
            "components": [
                { "type": 10, "content": "## 🔑 Gerador de Chaves em Massa" },
                { "type": 10, "content": "> **Passo 1 de 2:** Selecione as funcionalidades que este lote de chaves irá conceder." },
                { "type": 14, "divider": true, "spacing": 1 },
                new ActionRowBuilder().addComponents(selectMenu).toJSON(),
                { "type": 14, "divider": true, "spacing": 1 },
                {
                    "type": 1, "components": [
                        { "type": 2, "style": ButtonStyle.Secondary, "label": "Voltar", "emoji": { "name": "↩️" }, "custom_id": "devpanel" }
                    ]
                }
            ]
        }
    ];
};