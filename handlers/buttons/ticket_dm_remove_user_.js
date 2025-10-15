// Crie este novo arquivo em: handlers/buttons/ticket_dm_remove_user_.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ticket_remove_user_', // Handler dinâmico
    async execute(interaction) {
        const ticketId = interaction.customId.split('_')[3];

        const selectMenu = new UserSelectMenuBuilder()
            .setCustomId(`select_ticket_remove_user_${ticketId}`) // Passa o ID
            .setPlaceholder('Selecione um membro para remover');
        
        const cancelButton = new ButtonBuilder()
            .setCustomId('delete_ephemeral_reply')
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);
        
        await interaction.reply({ 
            content: 'Selecione abaixo o membro que deseja remover deste atendimento.',
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            ephemeral: true 
        });
    }
};