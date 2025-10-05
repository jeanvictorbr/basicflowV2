const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
module.exports = {
    customId: 'ausencia_set_canal_logs',
    async execute(interaction) {
        const channels = interaction.guild.channels.cache.filter(c => c.type === ChannelType.GuildText).map(c => ({ label: `#${c.name}`, value: c.id })).slice(0, 25);
        const selectMenu = new StringSelectMenuBuilder().setCustomId('select_ausencia_canal_logs').setPlaceholder('Selecione o canal de logs').addOptions(channels);
        const cancelButton = new ButtonBuilder().setCustomId('open_ausencias_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)] });
    }
};