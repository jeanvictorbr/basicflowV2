// Crie em: handlers/buttons/tickets_set_cargo_suporte.js
const { ActionRowBuilder, RoleSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'tickets_set_cargo_suporte',
    async execute(interaction) {
        const selectMenu = new RoleSelectMenuBuilder().setCustomId('select_tickets_cargo_suporte').setPlaceholder('Selecione o cargo de suporte');
        const cancelButton = new ButtonBuilder().setCustomId('open_tickets_menu').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            flags: V2_FLAG | EPHEMERAL_FLAG
        });
    }
};