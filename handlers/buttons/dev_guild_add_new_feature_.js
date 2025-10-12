// Crie em: handlers/buttons/dev_guild_add_new_feature_.js
const { StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const FEATURES = require('../../config/features.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_add_new_feature_',
    async execute(interaction) {
        const guildId = interaction.customId.split('_')[5];

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`select_dev_guild_add_feature_${guildId}`)
            .setPlaceholder('Selecione as features para adicionar')
            .setMinValues(1)
            .setMaxValues(FEATURES.length)
            .addOptions(FEATURES);

        const cancelButton = new ButtonBuilder().setCustomId(`dev_guild_edit_features_${guildId}`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};