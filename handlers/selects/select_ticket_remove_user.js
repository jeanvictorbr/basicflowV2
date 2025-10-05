// Crie em: handlers/selects/select_ticket_remove_user.js
const { PermissionsBitField } = require('discord.js');
const generateTicketDashboard = require('../../ui/ticketDashboard.js');
const db = require('../../database.js');
const V2_FLAG = 1 << 15; const EPHEMERAL_FLAG = 1 << 6;

module.exports = {
    customId: 'select_ticket_remove_user',
    async execute(interaction) {
        const memberId = interaction.values[0];
        const member = await interaction.guild.members.fetch(memberId);
        await interaction.channel.permissionOverwrites.delete(member);
        
        const ticketData = (await db.query('SELECT * FROM tickets WHERE channel_id = $1', [interaction.channel.id])).rows[0];
        await interaction.update({ components: generateTicketDashboard(ticketData), flags: V2_FLAG | EPHEMERAL_FLAG });
        await interaction.followUp({ content: `${member} foi removido do ticket por ${interaction.user}.`, ephemeral: false });
    }
};