// handlers/buttons/tickets_department_add.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15;
const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_department_add',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder()
            .setCustomId('select_new_department_role')
            .setPlaceholder('Primeiro, selecione o cargo de suporte para o novo departamento');

        const cancelButton = new ButtonBuilder()
            .setCustomId('tickets_config_departments')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);

        await interaction.update({
            components: [
                new ActionRowBuilder().addComponents(selectMenu),
                new ActionRowBuilder().addComponents(cancelButton)
            ],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};