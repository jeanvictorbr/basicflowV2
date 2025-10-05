// handlers/buttons/ausencia_set_canal_aprovacoes.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ausencia_set_canal_aprovacoes',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_ausencia_canal_aprovacoes')
            .setPlaceholder('Selecione o canal de aprovações')
            .addChannelTypes(ChannelType.GuildText);

        const cancelButton = new ButtonBuilder().setCustomId('open_ausencias_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            content: 'Por favor, selecione o canal onde as ausências serão enviadas para aprovação.',
            embeds: [],
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: 0 // Limpa as flags V2 para mostrar componentes normais
        });
    }
};