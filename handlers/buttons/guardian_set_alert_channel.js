// Crie em: handlers/buttons/guardian_set_alert_channel.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'guardian_set_alert_channel',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_guardian_alert_channel')
            .setPlaceholder('Selecione o canal para receber alertas de conflito')
            .addChannelTypes(ChannelType.GuildText);

        const cancelButton = new ButtonBuilder().setCustomId('open_guardian_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};