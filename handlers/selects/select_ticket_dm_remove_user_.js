// Substitua o conteúdo em: handlers/selects/select_ticket_dm_remove_user_.js
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_remove_user_',
    async execute(interaction) {
        await interaction.deferUpdate();
        const ticketId = interaction.customId.split('_')[4];
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);

        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [ticketId])).rows[0];
        const thread = await interaction.guild.channels.fetch(ticket.thread_id);

        await thread.members.remove(memberId);

        // --- NOTIFICAÇÃO PARA O USUÁRIO NA DM ---
        try {
            const customer = await interaction.client.users.fetch(ticket.user_id);
            await customer.send(`> ℹ️ O atendente **${interaction.user.username}** removeu **${member.user.username}** da conversa.`);
        } catch (e) {
            console.error("Falha ao notificar usuário sobre remoção de membro:", e);
        }
        // --- FIM DA NOTIFICAÇÃO ---

        await interaction.editReply({ content: `✅ ${member} foi removido deste atendimento.`, components: [] });
        await thread.send(`> ➖ ${member} foi removido da conversa por ${interaction.user}.`);
    }
};