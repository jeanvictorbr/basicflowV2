// handlers/buttons/welcome_set_autorole.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'welcome_set_autorole',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder().setCustomId('select_welcome_autorole').setPlaceholder('Selecione o cargo para novos membros');
        const cancelButton = new ButtonBuilder().setCustomId('open_welcome_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};