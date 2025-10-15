// Substitua o conteúdo em: handlers/selects/select_ticket_remove_user.js
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');

module.exports = {
    customId: 'select_ticket_remove_user',
    async execute(interaction) {
        await interaction.deferUpdate();
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);

        const ticket = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];

        await interaction.channel.permissionOverwrites.delete(member);
        
        const newAction = `> ${member} foi removido por ${interaction.user}.\n`;
        await db.query(`UPDATE tickets SET action_log = action_log || $1 WHERE channel_id = $2`, [newAction, interaction.channel.id]);

        // --- NOTIFICAÇÃO PARA O USUÁRIO NA DM ---
        if (ticket.is_dm_ticket) {
            try {
                const customer = await interaction.client.users.fetch(ticket.user_id);
                await customer.send(`> ℹ️ O atendente **${interaction.user.username}** removeu **${member.user.username}** da conversa.`);
            } catch (e) {
                console.error("Falha ao notificar usuário sobre remoção de membro:", e);
            }
        }
        // --- FIM DA NOTIFICAÇÃO ---

        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const openerMember = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);

        const dashboard = generateTicketDashboard(ticketData, openerMember, interaction.member, settings.tickets_cargo_suporte);
        await interaction.editReply({ ...dashboard });

        await interaction.channel.send({ content: `❌ ${member} foi removido do ticket.` });
    }
};