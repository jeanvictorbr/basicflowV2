// handlers/buttons/guardian_channels_set_ignored.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_channels_set_ignored',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_guardian_channels_ignored')
            .setPlaceholder('Selecione os canais que a IA deve ignorar')
            .addChannelTypes(ChannelType.GuildText)
            .setMinValues(0)
            .setMaxValues(25);

        const cancelButton = new ButtonBuilder().setCustomId('guardian_manage_channels').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowrowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};