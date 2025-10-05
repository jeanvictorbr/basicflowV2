// handlers/buttons/registros_publicar_vitrine.js
const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, ButtonBuilder, ButtonStyle } = require('discord.js');

const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'registros_publicar_vitrine',
    async execute(interaction) {
        const selectMenu = new ChannelSelectMenuBuilder()
            .setCustomId('select_registros_publicar_vitrine')
            .setPlaceholder('Selecione o canal para publicar a vitrine')
            .addChannelTypes(ChannelType.GuildText);

        const cancelButton = new ButtonBuilder().setCustomId('open_registros_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        // AQUI ESTAVA O ERRO: ActionRowRowBuilder -> ActionRowBuilder
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};