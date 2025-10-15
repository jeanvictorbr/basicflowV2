// Crie o arquivo: handlers/selects/select_ticket_add_user_.js
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_add_user_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const ticketId = interaction.customId.split('_')[4];
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);

        // A interação original (menu de seleção) foi na thread, então interaction.channel.id é o ID da thread
        const thread = interaction.channel;
        await thread.members.add(memberId);
        
        await interaction.editReply({ content: `✅ ${member} foi adicionado a este atendimento.`, components: [] });
        await thread.send(`> ➕ ${member} foi adicionado à conversa por ${interaction.user}.`);
    }
};