// handlers/buttons/ticket_add_user.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ticket_add_user',
    async execute(interaction) {
        const selectMenu = new UserSelectMenuBuilder().setCustomId('select_ticket_add_user').setPlaceholder('Selecione um membro para adicionar');
        const cancelButton = new ButtonBuilder().setCustomId('ticket_cancel_action').setLabel('Cancelar').setStyle(ButtonStyle.Secondary);
        // O dashboard do ticket agora é um embed normal, não precisa mais das flags V2 para ser modificado
        await interaction.update({ embeds: [], components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)] });
    }
};