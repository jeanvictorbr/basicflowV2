// Crie em: handlers/buttons/mod_set_monitor_channel.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_set_monitor_channel',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_mod_monitor_channel')
            .setPlaceholder('Selecione o canal para os logs do monitor')
            .addChannelTypes(ChannelType.GuildText);
        const cancelButton = new ButtonBuilder().setCustomId('mod_open_premium_hub').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};