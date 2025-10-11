// Crie em: handlers/buttons/store_set_staff_role.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_set_staff_role',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder().setCustomId('select_store_staff_role').setPlaceholder('Selecione o cargo staff da loja');
        const cancelButton = new ButtonBuilder().setCustomId('store_config_main').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};