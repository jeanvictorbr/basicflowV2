// handlers/buttons/registros_set_cargo_aprovado.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { V2_FLAG, EPHEMERAL_FLAG } = require('../../utils/flags.js');

module.exports = {
    customId: 'registros_set_cargo_aprovado',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder().setCustomId('select_registros_cargo_aprovado').setPlaceholder('Selecione o cargo para membros aprovados');
        const cancelButton = new ButtonBuilder().setCustomId('open_registros_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};