// Crie em: handlers/buttons/store_set_category.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_set_category',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder().setCustomId('select_store_category').setPlaceholder('Selecione a categoria para criar os carrinhos').addChannelTypes(ChannelType.GuildCategory);
        const cancelButton = new ButtonBuilder().setCustomId('store_config_main').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};