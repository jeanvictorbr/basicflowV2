// Crie este novo arquivo em: handlers/buttons/ticket_dm_add_user_.js
const { UserSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    customId: 'ticket_add_user_', // Handler dinâmico
    async execute(interaction) {
        // Extrai o ID do ticket do customId do botão
        const ticketId = interaction.customId.split('_')[3];

        const selectMenu = new UserSelectMenuBuilder()
            .setCustomId(`select_ticket_add_user_${ticketId}`) // Passa o ID para o próximo passo
            .setPlaceholder('Selecione um membro para adicionar');
        
        const cancelButton = new ButtonBuilder()
            .setCustomId('delete_ephemeral_reply') // Botão genérico para fechar a mensagem
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary);
        
        // Responde de forma efêmera na thread
        await interaction.reply({ 
            content: 'Selecione abaixo o membro que deseja adicionar a este atendimento.',
            components: [new ActionRowBuilder().addComponents(selectMenu), new ActionRowBuilder().addComponents(cancelButton)],
            ephemeral: true 
        });
    }
};