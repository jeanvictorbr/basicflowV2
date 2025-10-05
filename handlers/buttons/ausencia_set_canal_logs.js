// handlers/buttons/ausencia_set_canal_logs.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ausencia_set_canal_logs',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_ausencia_canal_logs')
            .setPlaceholder('Selecione o canal de logs')
            .addChannelTypes(ChannelType.GuildText);

        const cancelButton = new ButtonBuilder().setCustomId('open_ausencias_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            content: 'Por favor, selecione o canal onde os logs de ausências (aprovações, recusas) serão registrados.',
            embeds: [],
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: 0
        });
    }
};