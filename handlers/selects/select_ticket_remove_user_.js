// Crie o arquivo: handlers/selects/select_ticket_remove_user_.js
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_remove_user_', // Handler dinâmico
    async execute(interaction) {
        await interaction.deferUpdate();
        const ticketId = interaction.customId.split('_')[4];
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);

        const thread = interaction.channel;
        await thread.members.remove(memberId);

        await interaction.editReply({ content: `✅ ${member} foi removido deste atendimento.`, components: [] });
        await thread.send(`> ➖ ${member} foi removido da conversa por ${interaction.user}.`);
    }
};