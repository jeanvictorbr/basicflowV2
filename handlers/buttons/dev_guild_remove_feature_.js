// Crie em: handlers/buttons/dev_guild_remove_feature_.js
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'dev_guild_remove_feature_',
    async execute(interaction) {
        const [, , , , , guildId, featureKey] = interaction.customId.split('_');

        const confirmationButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`dev_guild_remove_feature_confirm_${guildId}_${featureKey}`).setLabel('Sim, Remover Feature').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`dev_guild_edit_features_${guildId}`).setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );

        await interaction.update({
            components: [
                { type: 17, components: [
                    { type: 10, content: `## ⚠️ Confirmação de Remoção` },
                    { type: 10, content: `> Tem certeza que deseja remover a feature **${featureKey}** desta guilda?` }
                ]},
                confirmationButtons
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};