const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'suggestions_set_log_channel',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder().setCustomId('select_suggestions_log_channel').setPlaceholder('Selecione o canal de logs').addChannelTypes(ChannelType.GuildText);
        const cancelButton = new ButtonBuilder().setCustomId('open_suggestions_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};