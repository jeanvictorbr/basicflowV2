// Crie em: handlers/buttons/store_set_client_role.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'store_set_client_role',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId('select_store_client_role')
            .setPlaceholder('Selecione o cargo que o comprador receberá');
            
        const cancelButton = new ButtonBuilder().setCustomId('store_config_main').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};