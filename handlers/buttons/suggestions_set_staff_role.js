const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;
module.exports = {
    customId: 'suggestions_set_staff_role',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder().setCustomId('select_suggestions_staff_role').setPlaceholder('Selecione o cargo que pode gerenciar sugestões');
        const cancelButton = new ButtonBuilder().setCustomId('open_suggestions_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};