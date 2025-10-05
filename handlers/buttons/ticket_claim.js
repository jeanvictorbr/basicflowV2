// handlers/buttons/ticket_claim.js
const db = require('../../database.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');

module.exports = {
    customId: 'ticket_claim',
    async execute(interaction) {
        const settings = (await db.query('SELECT * FROM guild_settings WHERE guild_id = $1', [interaction.guild.id])).rows[0];
        if (!interaction.member.roles.cache.has(settings.tickets_cargo_suporte)) {
            return interaction.reply({ content: '❌ Você não tem permissão para assumir um ticket.', ephemeral: true });
        }

        await interaction.deferUpdate();
        const newAction = `> Ticket assumido por ${interaction.user}.\n`;
        await db.query(`UPDATE tickets SET claimed_by = $1, action_log = action_log || $2 WHERE channel_id = $3`, [interaction.user.id, newAction, interaction.channel.id]);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        const openerMember = await interaction.guild.members.fetch(ticketData.user_id).catch(() => null);
        
        const dashboard = generateTicketDashboard(ticketData, openerMember, interaction.user.id, settings.tickets_cargo_suporte);
        await interaction.editReply({ ...dashboard });
    }
};