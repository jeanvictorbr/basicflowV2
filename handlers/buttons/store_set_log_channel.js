// Crie em: handlers/buttons/store_set_log_channel.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_set_log_channel',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder().setCustomId('select_store_log_channel').setPlaceholder('Selecione o canal de logs').addChannelTypes(ChannelType.GuildText);
        const cancelButton = new ButtonBuilder().setCustomId('store_config_main').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};