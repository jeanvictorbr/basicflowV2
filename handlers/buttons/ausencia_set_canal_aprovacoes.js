// handlers/buttons/ausencia_set_canal_aprovacoes.js
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');

module.exports = {
    customId: 'ausencia_set_canal_aprovacoes',
    async execute(interaction) {
        const channels = interaction.guild.channels.cache
            .filter(c => c.type === ChannelType.GuildText)
            .map(c => ({ label: `#${c.name}`, value: c.id }))
            .slice(0, 25);

        if (channels.length === 0) return interaction.reply({ content: 'Não há canais de texto para selecionar.', ephemeral: true });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_ausencia_canal_aprovacoes') // ID para o handler do select
            .setPlaceholder('Selecione o canal de aprovações')
            .addOptions(channels);
        
        const cancelButton = new ButtonBuilder().setCustomId('open_ausencias_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            embeds: [],
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)]
        });
    }
};