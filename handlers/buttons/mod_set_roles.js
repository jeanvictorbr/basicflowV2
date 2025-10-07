// Crie em: handlers/buttons/mod_set_roles.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'mod_set_roles',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId('select_mod_roles')
            .setPlaceholder('Selecione os cargos que podem usar os comandos')
            .setMinValues(0)
            .setMaxValues(10);

        const cancelButton = new ButtonBuilder().setCustomId('open_moderacao_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};