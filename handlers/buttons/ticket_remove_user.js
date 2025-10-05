// Crie em: handlers/buttons/ticket_remove_user.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'ticket_remove_user',
    async execute(interaction) {
        const selectMenu = new UserSelectMenuBuilder().setCustomId('select_ticket_remove_user').setPlaceholder('Selecione um membro para remover');
        const cancelButton = new ButtonBuilder().setCustomId('ticket_cancel_action').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        await interaction.update({ components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)], flags: V2_FLAG | EPHEMERAL_FLAG });
    }
};